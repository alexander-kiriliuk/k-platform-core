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
import { XdbActions, XdbObject } from "@xml-data-bridge/src/xml-data-bridge.types";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource, EntityMetadata, In, Repository } from "typeorm";
import { MsException } from "@shared/exceptions/ms.exception";
import { ColumnMetadata } from "typeorm/metadata/ColumnMetadata";


@Injectable()
export class XmlDataBridgeService {

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @Inject(LOGGER) private readonly logger: Logger) {
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

  private async processMediaNodes(item: XdbActions) {
    // todo implement
    return;
  }

  private async processRemoveNodes(item: XdbActions) {
    // todo implement
    return;
  }

  private async processInsertUpdateNodes(item: XdbActions) {
    const repository = this.connection.getRepository(item.attrs.target);
    for (const rowData of item.rows) {
      const uniqueKeyFields = this.getUniqueKeyFields(repository, rowData);
      const existingEntity = await repository.findOne({ where: uniqueKeyFields });
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
    const uniqueColumns = entityMetadata.columns.filter(column => this.isColumnUnique(entityMetadata, column));
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
