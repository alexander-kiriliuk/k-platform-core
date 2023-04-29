/*
 * Copyright 2023 Alexander Kiriliuk
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

import { HttpStatus, Inject, Injectable, Logger } from "@nestjs/common";
import { LOGGER } from "@shared/modules/log/log.constants";
import { MediaRow, XdbActions, XdbObject, XdbRowData } from "@xml-data-bridge/src/xml-data-bridge.types";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource, EntityMetadata, In, Repository } from "typeorm";
import { MsException } from "@shared/exceptions/ms.exception";
import { ColumnMetadata } from "typeorm/metadata/ColumnMetadata";
import { MsClient } from "@shared/modules/ms-client/ms-client";
import { Media, UpsertMediaRequest } from "@media/src/media.types";
import { LocalizedString } from "@shared/modules/locale/locale.types";
import { FilesUtils } from "@shared/utils/files.utils";
import * as process from "process";
import * as path from "path";
import { LocalizedStringEntity } from "@shared/modules/locale/entity/localized-string.entity";
import readFile = FilesUtils.readFile;
import serializeFile = FilesUtils.serializeFile;

@Injectable()
export class XmlDataBridgeService {

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @Inject(LOGGER) private readonly logger: Logger,
    private readonly msClient: MsClient) {
  }

  private get connection() {
    return this.dataSource.manager.connection;
  }

  async importXml(xml: XdbObject): Promise<boolean> {
    try {
      for (const item of xml.schema) {
        switch (item.action) {
          case "InsertUpdate":
            await this.processInsertUpdateNodes(item);
            break;
          case "Media":
            await this.processMediaNodes(item);
            break;
          case "File":
            await this.processFileNodes(item);
            break;
          case "Remove":
            await this.processRemoveNodes(item);
            break;
        }
      }
      return true;
    } catch (error) {
      throw new MsException(
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Error importing XML: ${error.message}`
      );
    }
  }

  async exportXml(target: string, id: string) {
    // todo implement
    return true;
  }

  private async processFileNodes(item: XdbActions) {
    // todo implement
    return true;
  }

  private async processMediaNodes(item: XdbActions) {
    const mediaRows = item.rows as MediaRow[];
    for (const row of mediaRows) {
      const existedMedia = await this.msClient.dispatch<Media, string>("media.get.any.by.code", row.code);
      const localizedStrings: LocalizedStringEntity[] = [];
      if (row.name) {
        const rep = this.connection.getRepository(LocalizedStringEntity);
        for (const value of row.name.values) {
          const v = await rep.findOne({ where: { [row.name.attrs.key]: value } });
          localizedStrings.push(v);
        }
      }
      const buf = await this.readFileData(row.file);
      const media = await this.msClient.dispatch<Media, UpsertMediaRequest>("media.upsert", {
        type: row.type,
        code: row.code,
        entityName: localizedStrings as LocalizedString[],
        entityIdForPatch: existedMedia?.id,
        file: serializeFile({
          originalname: path.basename(row.file),
          buffer: buf,
          size: Buffer.byteLength(buf.toString())
        })
      }, { timeout: 30000 });
      this.logger.log(`${existedMedia ? `Update` : `Create`} media with ID ${media.id}`);
    }
    return;
  }

  private async readFileData(path: string) {
    return await readFile(process.cwd() + path);
  }

  private async processRemoveNodes(item: XdbActions) {
    const repository = this.connection.getRepository(item.attrs.target);
    for (const rowData of item.rows) {
      const whereConditions = this.getRowDataWhereConditions(rowData);
      if (Object.keys(whereConditions).length > 0) {
        const entityToRemove = await repository.findOne({ where: whereConditions });
        if (entityToRemove) {
          await repository.remove(entityToRemove);
          this.logEntityRemoved(repository, whereConditions);
        } else {
          this.logger.warn(
            `Entity [${item.attrs.target}] with ${JSON.stringify(whereConditions)} not found, no removal performed`
          );
        }
      } else {
        this.logger.warn(
          `Invalid row data for [${item.attrs.target}], no removal performed`
        );
      }
    }
  }

  private getRowDataWhereConditions(rowData: XdbRowData): object {
    const whereConditions = {};
    for (const key in rowData) {
      if (rowData[key].value) {
        whereConditions[key] = rowData[key].value;
      } else {
        whereConditions[key] = rowData[key];
      }
    }
    return whereConditions;
  }

  private logEntityRemoved(repository: Repository<any>, whereConditions: object) {
    const metadata = repository.metadata;
    const keyValuePairs = Object.entries(whereConditions)
      .map(([key, value]) => `${key}=${value}`)
      .join("; ");
    this.logger.log(`Removed [${metadata.targetName}] with ${keyValuePairs}`);
  }

  private async processInsertUpdateNodes(item: XdbActions) {
    const repository = this.connection.getRepository(item.attrs.target);
    for (const rowData of item.rows) {
      const uniqueKeyFields = this.getUniqueKeyFields(repository, rowData);
      let existingEntity = null;
      if (Object.keys(uniqueKeyFields).length) {
        existingEntity = await repository.findOne({ where: uniqueKeyFields });
      }
      let entity;
      if (existingEntity) {
        entity = await this.updateEntityFromRowData(existingEntity, repository, rowData);
      } else {
        entity = await this.createEntityFromRowData(repository, rowData);
      }
      await repository.save(entity);
      this.logEntitySaved(repository, entity, uniqueKeyFields, existingEntity);
    }
  }

  private logEntitySaved(repository: Repository<any>, entity: any, uniqueKeyFields: object, existingEntity: any) {
    const metadata = repository.metadata;
    const primaryKey = metadata.primaryColumns[0].propertyName;
    const keys = [primaryKey, ...Object.keys(uniqueKeyFields)];
    const values = [entity[primaryKey], ...Object.values(uniqueKeyFields)];
    const keyValuePairs = keys.map((key, index) => `${key}=${values[index]}`).join("; ");
    this.logger.log(`${existingEntity ? `Update` : `Create`} [${metadata.targetName}] with ${keyValuePairs}`);
  }

  private getUniqueKeyFields(repository: Repository<any>, rowData: { [key: string]: any }): object {
    const entityMetadata = repository.metadata;
    const uniqueColumns = entityMetadata.columns.filter(column => {
      if (this.isColumnUnique(entityMetadata, column)) {
        return true;
      }
      const uniqIndices = repository.metadata.indices.find(idc => idc.isUnique);
      return !!uniqIndices?.columns?.find(col => col.propertyName === column.propertyName);
    });
    const uniqueKeyFields = {};
    for (const uniqueColumn of uniqueColumns) {
      const propertyName = uniqueColumn.propertyName;
      if (rowData[propertyName]) {
        uniqueKeyFields[propertyName] = rowData[propertyName].value || rowData[propertyName];
      }
    }
    return uniqueKeyFields;
  }

  private async setEntityPropertiesFromRowData(
    entity: any,
    repository: Repository<any>,
    rowData: { [key: string]: any }) {
    for (const key in rowData) {
      const relation = repository.metadata.findRelationWithPropertyPath(key);
      if (relation && rowData[key].attrs) {
        if (rowData[key].value) {
          const relatedRepository = this.connection.getRepository(relation.type);
          entity[key] = await relatedRepository.findOne({
            where: {
              [rowData[key].attrs.key]: rowData[key].value
            }
          });
        } else if (rowData[key].values && rowData[key].attrs) {
          const relatedRepository = this.connection.getRepository(
            relation.inverseEntityMetadata.targetName
          );
          entity[key] = await relatedRepository.find({
            where: {
              [rowData[key].attrs.key]: In(rowData[key].values)
            }
          });
        }
      } else if (rowData[key].value) {
        entity[key] = rowData[key].value;
      } else if (rowData[key].values) {
        entity[key] = rowData[key].values;
      } else {
        entity[key] = rowData[key];
      }
    }
    return entity;
  }

  private async updateEntityFromRowData(
    existingEntity: any,
    repository: Repository<any>,
    rowData: { [key: string]: any }) {
    return this.setEntityPropertiesFromRowData(existingEntity, repository, rowData);
  }

  private async createEntityFromRowData(
    repository: Repository<any>,
    rowData: { [key: string]: any }) {
    const entity = repository.create();
    return this.setEntityPropertiesFromRowData(entity, repository, rowData);
  }

  private isColumnUnique(md: EntityMetadata, column: ColumnMetadata) {
    for (const uniq of md.uniques) {
      if (uniq.columns.find(col => col.propertyName === column.propertyName) !== undefined) {
        return true;
      }
    }
    return false;
  }

}
