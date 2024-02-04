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

import { Inject, Injectable, Logger } from "@nestjs/common";
import { LOGGER } from "@shared/modules/log/log.constants";
import { FileRow, MediaRow, XdbAction, XdbObject, XdbRowData } from "@xml-data-bridge/xml-data-bridge.types";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource, EntityMetadata, In, Repository } from "typeorm";
import { ColumnMetadata } from "typeorm/metadata/ColumnMetadata";
import { FilesUtils } from "@shared/utils/files.utils";
import { LocalizedStringEntity } from "@shared/modules/locale/entity/localized-string.entity";
import { File } from "@files/file.types";
import { Media, MediaManager } from "@media/media.types";
import { Xdb, XdbImportService } from "@xml-data-bridge/xml-data-bridge.constants";
import { FileManager } from "@files/file.constants";
import { CacheService } from "@shared/modules/cache/cache.types";
import { KpConfig } from "../../gen-src/kp.config";
import { NumberUtils } from "@shared/utils/number.utils";
import * as AdmZip from "adm-zip";
import * as fs from "fs";
import * as path from "path";
import readFile = FilesUtils.readFile;
import createDirectoriesIfNotExist = FilesUtils.createDirectoriesIfNotExist;
import readDirectoryRecursively = FilesUtils.readDirectoryRecursively;
import ReadOperatorRe = Xdb.ReadOperatorRe;
import generateRandomInt = NumberUtils.generateRandomInt;

/**
 * XmlDataBridgeService is responsible for importing and exporting data through XML.
 */
@Injectable()
export class XmlDataBridgeImportService extends XdbImportService {

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @Inject(LOGGER) private readonly logger: Logger,
    private readonly mediaService: MediaManager,
    private readonly filesService: FileManager,
    private readonly cacheService: CacheService) {
    super();
  }

  private get connection() {
    return this.dataSource.manager.connection;
  }

  /**
   * Import XML data from an XdbObject.
   * @param xml - The XdbObject containing the XML data.
   * @returns A promise that resolves to a boolean indicating whether the import was successful.
   */
  async importXml(xml: XdbObject): Promise<boolean> {
    for (const item of xml.schema) {
      await this.processReadOperators(item.rows);
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
        case "Include":
          await this.processIncludeNodes(item);
          break;
      }
    }
    return true;
  }


  /**
   * Import XML data from Zip-archive.
   * @param fileData - The XdbObject containing the XML data.
   * @returns A promise that resolves to a boolean indicating whether the import was successful.
   */
  async importFromFile(fileData: Buffer) {
    // write archive
    const tmpDir = process.cwd() + await this.cacheService.get(KpConfig.TMP_DIR);
    await createDirectoriesIfNotExist(tmpDir);
    const fileName = generateRandomInt();
    const filePath = `${tmpDir}/${fileName}.zip`;
    const operationDir = `${tmpDir}/${fileName}`;
    await fs.promises.writeFile(filePath, fileData);
    // work with archive
    const arch = new AdmZip(filePath);
    await createDirectoriesIfNotExist(operationDir);
    arch.extractAllTo(operationDir, true);
    const fileList = await readDirectoryRecursively(operationDir);
    const xmlFiles: string [] = [];
    for (const dir of Object.keys(fileList)) {
      if (!fileList[dir]?.length) {
        continue;
      }
      for (const file of fileList[dir].sort()) {
        const extractedFilePath = path.normalize(`${operationDir}/${dir}/${file}`);
        if (!extractedFilePath.endsWith(".xml")) {
          continue;
        }
        const contentBuf = await readFile(extractedFilePath);
        const zipDir = operationDir.replace(process.cwd(), "");
        const contentStr = contentBuf.toString().replace(/@zip:/g, zipDir);
        const modifiedBuf = Buffer.from(contentStr);
        const xml = await Xdb.parseXmlFile(modifiedBuf);
        await this.importXml(xml);
        xmlFiles.push(extractedFilePath);
      }
    }
    return xmlFiles.length > 0;
  }

  /**
   * Process "file" nodes by creating or updating a file.
   * @param item - An XdbActions object containing rows of file data.
   * @returns A promise that resolves when all file nodes are processed.
   */
  private async processFileNodes(item: XdbAction) {
    const rows = item.rows as FileRow[];
    for (const row of rows) {
      let existedEntity: File;
      if (row.code) {
        existedEntity = await this.filesService.findByCode(row.code);
      }
      const localizedStrings = await this.getLocalizedStrings(row);
      const filePath = process.cwd() + row.file;
      const buf = await readFile(path.normalize(filePath));
      const isPublic = String(row.public) === "true";
      const file = await this.filesService.createOrUpdateFile(
        buf, row.file.split(".").pop(), isPublic, row.code, existedEntity?.id, localizedStrings
      );
      this.logger.log(`${existedEntity ? `Update` : `Create`} file with ID ${file.id}`);
    }
  }

  /**
   * Process "file" nodes by creating or updating a file.
   * @param item - An XdbActions object containing rows of file data.
   * @returns A promise that resolves when all file nodes are processed.
   */
  private async processIncludeNodes(item: XdbAction) {
    this.logger.log(item.attrs.read);
    const filePath = process.cwd() + item.attrs.read;
    const buf = await readFile(path.normalize(filePath));
    const xml = await Xdb.parseXmlFile(buf);
    await this.importXml(xml);
  }

  /**
   * Process "media" nodes by creating or updating a media object.
   * @param item - An XdbActions object containing rows of media data.
   * @returns A promise that resolves when all media nodes are processed.
   */
  private async processMediaNodes(item: XdbAction) {
    const rows = item.rows as MediaRow[];
    for (const row of rows) {
      let existedEntity: Media;
      if (row.code) {
        existedEntity = await this.mediaService.findByCode(row.code);
      }
      const localizedStrings = await this.getLocalizedStrings(row);
      const filePath = process.cwd() + row.file;
      const buf = await readFile(path.normalize(filePath));
      const media = await this.mediaService.createOrUpdateMedia(
        buf, row.type, row.code, existedEntity?.id, localizedStrings
      );
      this.logger.log(`${existedEntity ? `Update` : `Create`} media with ID ${media.id}`);
    }
  }

  /**
   * Process "remove" nodes by removing the specified entities.
   * @param item - An XdbActions object containing rows of entity data to remove.
   * @returns A promise that resolves when all remove nodes are processed.
   */
  private async processRemoveNodes(item: XdbAction) {
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

  /**
   * Get the WHERE conditions for a row data object.
   * @param rowData - An XdbRowData object containing data for a row.
   * @returns An object containing WHERE conditions.
   */
  private getRowDataWhereConditions(rowData: XdbRowData | FileRow): object {
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

  /**
   * Log that an entity has been removed.
   * @param repository - A TypeORM Repository instance for the entity.
   * @param whereConditions - An object containing WHERE conditions.
   */
  private logEntityRemoved(repository: Repository<any>, whereConditions: object) {
    const metadata = repository.metadata;
    const keyValuePairs = Object.entries(whereConditions)
      .map(([key, value]) => `${key}=${value}`)
      .join("; ");
    this.logger.log(`Removed [${metadata.targetName}] with ${keyValuePairs}`);
  }

  /**
   * Process "InsertUpdate" nodes by creating or updating entities.
   * @param item - An XdbActions object containing rows of entity data.
   * @returns A promise that resolves when all InsertUpdate nodes are processed.
   */
  private async processInsertUpdateNodes(item: XdbAction) {
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

  /**
   Log that an entity has been saved (created or updated).
   @param repository - A TypeORM Repository instance for the entity.
   @param entity - The saved entity.
   @param uniqueKeyFields - An object containing unique key fields.
   @param existingEntity - An existing entity, if any.
   */
  private logEntitySaved(repository: Repository<any>, entity: any, uniqueKeyFields: object, existingEntity: any) {
    const metadata = repository.metadata;
    const primaryKey = metadata.primaryColumns[0].propertyName;
    const keys = [primaryKey, ...Object.keys(uniqueKeyFields)];
    const values = [entity[primaryKey], ...Object.values(uniqueKeyFields)];
    const keyValuePairs = keys.map((key, index) => `${key}=${values[index]}`).join("; ");
    this.logger.log(`${existingEntity ? `Update` : `Create`} [${metadata.targetName}] with ${keyValuePairs}`);
  }

  /**
   Get the unique key fields for an entity based on the provided row data.
   @param repository - A TypeORM Repository instance for the entity.
   @param rowData - An object containing row data.
   @returns An object containing unique key fields.
   */
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

  /**
   Set entity properties from the provided row data.
   @param entity - The entity to set properties for.
   @param repository - A TypeORM Repository instance for the entity.
   @param rowData - An object containing row data.
   @returns The entity with properties set from rowData.
   */
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
        switch (entity[key]) {
          case "true":
            entity[key] = true;
            break;
          case "false":
            entity[key] = false;
            break;
          case "null":
            entity[key] = null;
            break;
        }
      }
    }
    return entity;
  }

  /**
   Update an existing entity with properties from the provided row data.
   @param existingEntity - The existing entity to update.
   @param repository - A TypeORM Repository instance for the entity.
   @param rowData - An object containing row data.
   @returns The updated entity.
   */
  private async updateEntityFromRowData(
    existingEntity: any,
    repository: Repository<any>,
    rowData: { [key: string]: any }) {
    return this.setEntityPropertiesFromRowData(existingEntity, repository, rowData);
  }

  /**
   Create a new entity with properties from the provided row data.
   @param repository - A TypeORM Repository instance for the entity.
   @param rowData - An object containing row data.
   @returns The created entity.
   */
  private async createEntityFromRowData(
    repository: Repository<any>,
    rowData: { [key: string]: any }) {
    const entity = repository.create();
    return this.setEntityPropertiesFromRowData(entity, repository, rowData);
  }

  /**
   Determine if a column is unique.
   @param metadata - EntityMetadata for the entity.
   @param column - ColumnMetadata for the column.
   @returns A boolean indicating whether the column is unique.
   */
  private isColumnUnique(metadata: EntityMetadata, column: ColumnMetadata) {
    for (const uniq of metadata.uniques) {
      if (uniq.columns.find(col => col.propertyName === column.propertyName) !== undefined) {
        return true;
      }
    }
    return false;
  }

  /**
   Build localized strings object from xml-row
   @param row - A xml-row object containing the name property.
   @returns A promise that resolves to an array of LocalizedStringEntity objects.
   */
  private async getLocalizedStrings(row: { name: any }): Promise<LocalizedStringEntity[]> {
    const localizedStrings: LocalizedStringEntity[] = [];
    if (row.name) {
      const rep = this.connection.getRepository(LocalizedStringEntity);
      for (const value of row.name.values) {
        const v = await rep.findOne({ where: { [row.name.attrs.key]: value } });
        localizedStrings.push(v);
      }
    }
    return localizedStrings;
  }

  /**
   Processes @read operators in attributes and nodes, downloads the file along the path contained
   in the ${@read:/path} construct, replaces this construct with its contents
   @param rows - A list of xml-row object containing the name property.
   */
  private async processReadOperators(rows: Array<XdbRowData | FileRow>) {
    for (const row of rows) {
      for (const val of Object.keys(row)) {
        let link: string = undefined;
        if (typeof row[val] === "string") {
          link = this.findReadOperator(row[val]);
          if (link) {
            const buf = await readFile(path.normalize(process.cwd() + link));
            row[val] = row[val].replace(ReadOperatorRe, buf.toString());
          }
        } else {
          link = this.findReadOperator(row[val].value);
          if (link) {
            const buf = await readFile(path.normalize(process.cwd() + link));
            row[val] = row[val].value.replace(ReadOperatorRe, buf.toString());
          }
        }
      }
    }
  }

  private findReadOperator(input: string) {
    const match = input.match(ReadOperatorRe);
    if (match?.length > 1) {
      return match[1];
    }
    return undefined;
  }

}
