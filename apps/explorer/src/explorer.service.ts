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
import { ExplorerTargetEntity } from "@explorer/src/entity/explorer-target.entity";
import { ExplorerColumnEntity } from "@explorer/src/entity/explorer-column.entity";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { DataSource, EntityMetadata, Repository } from "typeorm";
import { ColumnDataType, EntityData, TargetData } from "@explorer/src/explorer.types";
import { ColumnMetadata } from "typeorm/metadata/ColumnMetadata";
import { RelationMetadata } from "typeorm/metadata/RelationMetadata";
import { LocaleService } from "@shared/modules/locale/locale.service";
import { LOGGER } from "@shared/modules/log/log.constants";
import { NotFoundMsException } from "@shared/exceptions/not-found-ms.exception";
import { MsException } from "@shared/exceptions/ms.exception";

/**
 * Service for exploring and analyzing the database schema and relationships.
 */
@Injectable()
export class ExplorerService {

  /**
   * Constructs an instance of the ExplorerService.
   * @param dataSource The data source to work with.
   * @param targetRep Repository for the ExplorerTargetEntity.
   * @param columnRep Repository for the ExplorerColumnEntity.
   * @param logger The logger instance for logging actions.
   * @param localeService The service for handling localized strings.
   */
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(ExplorerTargetEntity)
    private readonly targetRep: Repository<ExplorerTargetEntity>,
    @InjectRepository(ExplorerColumnEntity)
    private readonly columnRep: Repository<ExplorerColumnEntity>,
    @Inject(LOGGER) private readonly logger: Logger,
    private readonly localeService: LocaleService) {
  }

  private get connection() {
    return this.dataSource.manager.connection;
  }

  /**
   * Analyzes the database and saves the results to the corresponding entities.
   */
  async analyzeDatabase() {
    this.logger.log(`Starting database analysis`);
    for (const md of this.connection.entityMetadatas) {
      if (md.tableType !== "regular") {
        continue;
      }
      const t = new ExplorerTargetEntity();
      t.target = md.targetName;
      t.name = await this.localeService.createLocalizedStrings(md.targetName);
      t.tableName = md.tableName;
      await this.saveTarget(t);
      t.columns = [];
      for (const column of md.nonVirtualColumns) {
        const c = new ExplorerColumnEntity();
        c.target = t;
        c.id = `${t.tableName}.${column.databasePath}`;
        c.name = await this.localeService.createLocalizedStrings(column.propertyName);
        c.property = column.propertyName;
        c.type = this.getColumnType(column.type as string);
        c.primary = md.primaryColumns.find(pc => pc.propertyName === column.propertyName) !== undefined;
        c.unique = this.isColumnUnique(md, column);
        c.multiple = false;
        t.columns.push(c);
        await this.saveColumn(c);
      }
      for (const relation of [...md.oneToManyRelations, ...md.manyToManyRelations]) {
        const c = new ExplorerColumnEntity();
        await this.setColumnProperties(c, relation, t);
        c.multiple = true;
        t.columns.push(c);
        await this.saveColumn(c);
      }
      for (const relation of [...md.oneToOneRelations, ...md.manyToOneRelations]) {
        const c = new ExplorerColumnEntity();
        await this.setColumnProperties(c, relation, t);
        c.multiple = false;
        t.columns.push(c);
        await this.saveColumn(c);
      }
    }
    this.logger.log(`Database was analyzed`);
  }

  /**
   * Retrieves entity data for the given target and rowId, with relations attached up to the specified depth.
   * @param target The target entity name.
   * @param rowId The ID of the row to fetch.
   * @param maxDepth The maximum depth of relations to fetch. Defaults to Infinity.
   * @returns A Promise that resolves to the EntityData object.
   */
  async getEntityData(target: string, rowId: string | number, maxDepth: number = Infinity): Promise<EntityData> {
    const targetData = await this.getTargetData(target);
    if (!targetData) {
      throw new NotFoundMsException(`Target entity not found: ${target}`);
    }
    const repository = this.connection.getRepository(targetData.entity.target);
    const row = await repository.findOne({ where: { [targetData.primaryColumn.property]: rowId } });
    if (!row) {
      throw new NotFoundMsException(`Row with ID ${rowId} not found in table ${target}`);
    }
    const withRelations = await this.attachRelations(row, targetData, [], maxDepth);
    return { entity: targetData.entity, data: withRelations };
  }

  /**
   * Attaches relations to the given row recursively up to the specified depth.
   * @param row The row to attach relations to.
   * @param targetData The target data of the current row.
   * @param visitedEntities The array of visited entity names.
   * @param maxDepth The maximum depth of relations to fetch. Defaults to Infinity.
   * @returns The row with attached relations.
   */
  private async attachRelations<T = any>(row: T, targetData: TargetData, visitedEntities: string[] = [], maxDepth: number = Infinity) {
    if (maxDepth < 0) {
      throw new MsException(HttpStatus.INTERNAL_SERVER_ERROR, "maxDepth should be non-negative");
    }
    const referencedCols = targetData.entity.columns.filter(c => c.type === "reference");
    const relations = referencedCols.map(c => c.property);
    if (!row || !relations.length || maxDepth <= 0) {
      return row;
    }
    const repository = this.connection.getRepository(targetData.entity.target);
    const idProp = targetData.primaryColumn.property;
    visitedEntities.push(targetData.entity.target);
    const withRelations = await repository.findOne({ where: { [idProp]: row[idProp] }, relations });
    for (let k in withRelations) {
      if (relations.indexOf(k) === -1) {
        continue;
      }
      const colData = targetData.entity.columns.find(c => c.property === k);
      const currTargetData = await this.getTargetData(colData.referencedEntityName);
      if (visitedEntities.includes(currTargetData.entity.target)) {
        continue;
      }
      if (Array.isArray(withRelations[k]) && colData.multiple) {
        for (let key in withRelations[k]) {
          withRelations[k][key] = await this.attachRelations(withRelations[k][key], currTargetData, visitedEntities.slice(), maxDepth - 1);
        }
      } else {
        withRelations[k] = await this.attachRelations(withRelations[k], currTargetData, visitedEntities.slice(), maxDepth - 1);
      }
    }
    return withRelations;
  }

  /**
   * Retrieves target data for the specified target entity name.
   * @param target The target entity name.
   * @returns A Promise that resolves to the TargetData object, or null if not found.
   */
  private async getTargetData(target: string): Promise<TargetData> {
    const entity = await this.targetRep.findOne({ where: { target }, relations: ["columns"] });
    if (!entity) {
      return null;
    }
    const primaryColumn = entity.columns.find(c => c.primary === true);
    return { entity, primaryColumn };
  }

  /**
   * Saves the target entity to the repository, if it does not exist.
   * @param target The target entity to save.
   */
  private async saveTarget(target: ExplorerTargetEntity) {
    const t = await this.targetRep.findOne({ where: { target: target.target } });
    if (t) {
      this.logger.verbose(`Entity ${target.target} already exists, skipping`);
      return;
    }
    await this.targetRep.save(target);
    this.logger.verbose(`Entity ${target.target} was created`);
  }

  /**
   * Saves the column entity to the repository, if it does not exist.
   * @param column The column entity to save.
   */
  private async saveColumn(column: ExplorerColumnEntity) {
    const c = await this.columnRep.findOne({ where: { id: column.id } });
    if (c) {
      this.logger.verbose(`Column ${column.id} already exists, skipping`);
      return;
    }
    await this.columnRep.save(column);
    this.logger.verbose(`Column ${column.id} was created`);
  }

  /**
   * Sets the properties of a column entity based on the given relation and target.
   * @param c The column entity to set properties for.
   * @param relation The relation metadata used to set properties.
   * @param target The target entity to associate the column with.
   */
  private async setColumnProperties(c: ExplorerColumnEntity, relation: RelationMetadata, target: ExplorerTargetEntity) {
    c.target = target;
    c.id = `${target.tableName}.${relation.propertyPath}`;
    c.name = await this.localeService.createLocalizedStrings(relation.propertyName);
    c.property = relation.propertyName;
    c.type = "reference";
    c.referencedTableName = relation.inverseEntityMetadata.tableName;
    c.referencedEntityName = relation.inverseEntityMetadata.targetName;
    c.primary = false;
    c.unique = false;
  }

  /**
   * Checks if the given column is unique within the entity metadata.
   * @param md The entity metadata to check.
   * @param column The column metadata to check for uniqueness.
   * @returns True if the column is unique, false otherwise.
   */
  private isColumnUnique(md: EntityMetadata, column: ColumnMetadata) {
    for (const uniq of md.uniques) {
      if (uniq.columns.find(col => col.propertyName === column.propertyName) !== undefined) {
        return true;
      }
    }
    return false;
  }

  /**
   * Converts a string type name to a corresponding ColumnDataType.
   * @param type The string type name.
   * @returns The corresponding ColumnDataType.
   */
  private getColumnType(type: string): ColumnDataType {
    switch (type) {
      case "string":
      case "text":
      case "uuid":
      case "simple-array":
      case "varchar":
      case "char":
      case "json":
      case "jsonb":
        return "string";
      case "int":
      case "int2":
      case "int4":
      case "int8":
      case "float4":
      case "float8":
      case "smallint":
      case "integer":
      case "bigint":
      case "numeric":
        return "number";
      case "boolean":
      case "bool":
        return "boolean";
      case "timestamp":
      case "timestamptz":
      case "date":
      case "time":
      case "timetz":
      case "interval":
        return "date";
      default:
        return "unknown";
    }
  }

}
