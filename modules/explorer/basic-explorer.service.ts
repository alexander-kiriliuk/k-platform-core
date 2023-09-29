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

import { Inject, Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common";
import { ExplorerTargetEntity } from "./entity/explorer-target.entity";
import { ExplorerColumnEntity } from "./entity/explorer-column.entity";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { Brackets, DataSource, EntityMetadata, ObjectLiteral, Repository, SelectQueryBuilder } from "typeorm";
import {
  ColumnDataType,
  ExplorerColumn,
  ExplorerSelectParams,
  ExplorerService,
  ExplorerTargetParams,
  TargetData
} from "./explorer.types";
import { ColumnMetadata } from "typeorm/metadata/ColumnMetadata";
import { RelationMetadata } from "typeorm/metadata/RelationMetadata";
import { LocaleService } from "@shared/modules/locale/locale.service";
import { LOGGER } from "@shared/modules/log/log.constants";
import { PageableData, PageableParams, SortOrder } from "@shared/modules/pageable/pageable.types";
import { TransformUtils } from "@shared/utils/transform.utils";
import { ObjectUtils } from "@shared/utils/object.utils";
import parseParamsString = TransformUtils.parseParamsString;

/**
 * Service for exploring and analyzing the database schema and relationships.
 */
@Injectable()
export class BasicExplorerService extends ExplorerService {

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(ExplorerTargetEntity)
    private readonly targetRep: Repository<ExplorerTargetEntity>,
    @InjectRepository(ExplorerColumnEntity)
    private readonly columnRep: Repository<ExplorerColumnEntity>,
    @Inject(LOGGER) private readonly logger: Logger,
    private readonly localeService: LocaleService) {
    super();
  }

  private get connection() {
    return this.dataSource.manager.connection;
  }

  /**
   * Analyzes the database and saves the results to the corresponding entities.
   */
  async analyzeDatabase(): Promise<void> {
    this.logger.log(`Starting database analysis`);
    for (const md of this.connection.entityMetadatas) {
      if (md.tableType !== "regular") {
        continue;
      }
      const t = new ExplorerTargetEntity();
      t.target = md.targetName;
      t.name = await this.localeService.createLocalizedStrings(md.targetName, `ex_target_${t.target}`);
      t.tableName = md.tableName;
      await this.saveTarget(t);
      t.columns = [];
      for (const column of md.nonVirtualColumns) {
        const c = new ExplorerColumnEntity();
        c.target = t;
        c.id = `${t.tableName}.${column.databasePath}`;
        c.name = await this.localeService.createLocalizedStrings(column.propertyName, `ex_col_${c.id}`);
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
   * Save or update an entity including its nested entities.
   * @param target - The name of the target entity.
   * @param entity - The entity object to be saved or updated.
   * @returns The saved or updated entity.
   * @throws {NotFoundException} If the target entity is not found.
   */
  async saveEntityData<T = any>(target: string, entity: T): Promise<T> {
    const targetData = await this.getTargetData(target);
    if (!targetData) {
      throw new NotFoundException(`Target entity not found: ${target}`);
    }
    const repository = this.connection.getRepository(targetData.entity.target);
    if (!entity[targetData.primaryColumn.property]) {
      entity = repository.create(entity) as T;
    }
    return await this.saveNestedEntities(entity, targetData, repository);
  }

  /**
   * Remove an entity by its ID.
   * @param target - The name of the target entity.
   * @param id - The ID of the entity to be removed.
   * @returns The removed entity.
   * @throws {NotFoundException} If the target entity or the entity with the specified ID is not found.
   */
  async removeEntity(target: string, id: string | number): Promise<ObjectLiteral> {
    const targetData = await this.getTargetData(target);
    if (!targetData) {
      throw new NotFoundException(`Target entity not found: ${target}`);
    }
    const repository = this.connection.getRepository(targetData.entity.target);
    const entity = await repository.findOne({ where: { [targetData.primaryColumn.property]: id } });
    if (!entity) {
      throw new NotFoundException(`Entity with ID ${id} not found in table ${target}`);
    }
    return await repository.remove(entity);
  }

  /**
   * Retrieves entity data for the given target and rowId, with relations attached up to the specified depth.
   * @param target The target entity name.
   * @param rowId The ID of the row to fetch.
   * @param maxDepth The maximum depth of relations to fetch. Defaults to Infinity.
   * @returns A Promise that resolves to the entity object.
   */
  async getEntityData(target: string, rowId: string | number, maxDepth = Infinity) {
    const targetData = await this.getTargetData(target, { object: true });
    if (!targetData) {
      throw new NotFoundException(`Target entity not found: ${target}`);
    }
    const repository = this.connection.getRepository(targetData.entity.target);
    const row = await repository.findOne({ where: { [targetData.primaryColumn.property]: rowId } });
    if (!row) {
      throw new NotFoundException(`Row with ID ${rowId} not found in table ${target}`);
    }
    return await this.attachRelations(row, targetData, { object: true }, [], maxDepth);
  }

  /**
   * Retrieves target data for the specified target entity name.
   * @param target The target entity name.
   * @param params
   * @returns A Promise that resolves to the TargetData object, or null if not found.
   */
  async getTargetData(target: string, params: ExplorerTargetParams = {}): Promise<TargetData> {
    const relations = !params.fullRelations ? ["columns"] : [
      "name", "name.lang", "columns", "columns.name", "columns.name.lang"
    ];
    const entity = await this.targetRep.findOne({
      where: [{ target }, { tableName: target }, { alias: target }], relations
    });
    if (!entity) {
      return null;
    }
    if (params.section) {
      entity.columns = entity.columns.filter(c => c.sectionEnabled);
      ObjectUtils.sort(entity.columns, "sectionPriority");
    } else if (params.object) {
      entity.columns = entity.columns.filter(c => c.objectEnabled);
      ObjectUtils.sort(entity.columns, "objectPriority");
    }
    const primaryColumn = entity.columns.find(c => c.primary === true);
    return { entity, primaryColumn };
  }

  /**
   * Retrieves paginated entity data with relations up to a depth of 2.
   *
   * @param target - The name of the target entity or table.
   * @param params - An optional object containing pageable parameters.
   * @returns A Promise that resolves to a PageableData object containing the paginated results.
   * @throws NotFoundException if the target entity is not found.
   */
  async getPageableEntityData(target: string, params?: PageableParams): Promise<PageableData> {
    const targetData = await this.getTargetData(target, { section: true });
    if (!targetData) {
      throw new NotFoundException(`Target entity not found: ${target}`);
    }
    const repository = this.connection.getRepository(targetData.entity.target);
    const primaryColumnProperty = targetData.primaryColumn.property;
    const limit = params?.limit || 20;
    const page = params?.page || 1;
    const sort = params?.sort || primaryColumnProperty;
    const order = params?.order || SortOrder.DESC;
    const qb = repository.createQueryBuilder("entity");
    if (params?.filter) {
      const filterParams = parseParamsString(params.filter);
      await this.applyFilterParams(qb, targetData, filterParams);
    }
    const colsForSelect = this.getColsForSelect(targetData, { section: true, prefix: "entity." });
    if (!colsForSelect.referencedCols.length) {
      qb.select(colsForSelect.colList);
    }
    const [items, totalCount] = await qb.skip((page - 1) * limit)
      .take(limit)
      .orderBy(`entity.${sort}`, order)
      .getManyAndCount();
    const itemsWithRelations = await Promise.all(
      items.map(async item =>
        await this.attachRelations(item, targetData, { section: true }, [], 2)
      )
    );
    return new PageableData(itemsWithRelations, totalCount, page, limit);
  }

  /**
   * Applies filter parameters to a SelectQueryBuilder for a specific entity.
   *
   * @param qb - The SelectQueryBuilder to apply filters to.
   * @param targetData - Information about the target entity.
   * @param filterParams - The filter parameters to apply.
   */
  async applyFilterParams<T = any>(qb: SelectQueryBuilder<T>, targetData: TargetData, filterParams: Record<string, string>) {
    for (const key in filterParams) {
      const value = filterParams[key];
      const column = targetData.entity.columns.find(c => c.property === key);
      if (!column) {
        continue;
      }
      const prop = column.property;
      if (column.type === "reference") {
        const match = value.match(/\{([^}]*)}/);
        const parts = match[1].split(".");
        const targetName = parts[0];
        const colName = parts[1];
        const clearValue = value.replace(/\{[^}]*}/g, "");
        const refTarget = await this.getTargetData(targetName, { section: true });
        const refColumn = refTarget.entity.columns.find(c => c.property === colName);
        const alias = colName + targetName;
        qb.innerJoinAndSelect(`entity.${prop}`, alias);
        if (refColumn.type === "date") {
          this.applyDateFilter(qb, alias, colName, clearValue);
        } else {
          this.applyColumnFilter(qb, refColumn, `${alias}.${colName}`, clearValue);
        }
      } else {
        if (column.type === "date") {
          this.applyDateFilter(qb, `entity`, prop, value);
        } else {
          this.applyColumnFilter(qb, column, `entity.${prop}`, value);
        }
      }
    }
  }

  /**
   * Applies a date filter to a SelectQueryBuilder.
   *
   * @param qb - The SelectQueryBuilder to apply the date filter to.
   * @param aliasOrEntity - The alias or entity to apply the filter on.
   * @param column - The column name to filter.
   * @param value - The date filter value.
   */
  private applyDateFilter<T = any>(qb: SelectQueryBuilder<T>, aliasOrEntity: string, column: string, value: string) {
    const match = value.match(/FROM(\d+)TO(\d+)/);
    const fromTimestamp = match[1];
    const toTimestamp = match[2];
    const fromDate = new Date(parseInt(fromTimestamp, 10));
    const toDate = new Date(parseInt(toTimestamp, 10));
    qb.andWhere(new Brackets(sqb => {
      sqb.andWhere(`${aliasOrEntity}.${column} >= :from${column}`, { [`from${column}`]: fromDate.toJSON() });
      sqb.andWhere(`${aliasOrEntity}.${column} <= :to${column}`, { [`to${column}`]: toDate.toJSON() });
    }));
  }

  /**
   * Applies a column filter to a SelectQueryBuilder.
   *
   * @param qb - The SelectQueryBuilder to apply the column filter to.
   * @param exCol - The ExplorerColumn data
   * @param path - The column name to filter.
   * @param value - The column filter value.
   */
  private applyColumnFilter<T = any>(qb: SelectQueryBuilder<T>, exCol: ExplorerColumn, path: string, value: string) {
    if (exCol.type === "boolean") {
      value = value === "true" ? "1" : "0";
    }
    const exactMatch = !(value.startsWith("%") && value.endsWith("%"));
    qb.andWhere(`${path} ${exactMatch ? "=" : "LIKE"} :${path}`, { [path]: value });
  }

  /**
   * Recursively save or update nested entities.
   * @param entity - The entity containing nested entities to be saved or updated.
   * @param targetData - Metadata of the target entity.
   * @param repository - The repository associated with the target entity.
   * @returns The saved or updated entity with its nested entities.
   */
  private async saveNestedEntities<T = any>(entity: T, targetData: TargetData, repository: Repository<any>): Promise<T> {
    const referencedCols = targetData.entity.columns.filter(c => c.type === "reference");
    for (const col of referencedCols) {
      const relationProp = col.property;
      const relatedEntityData = entity[relationProp];
      if (relatedEntityData) {
        const currTargetData = await this.getTargetData(col.referencedEntityName);
        if (!currTargetData) {
          entity[relationProp] = repository.create();
        } else {
          const relatedRepository = this.connection.getRepository(currTargetData.entity.target);
          if (Array.isArray(relatedEntityData) && col.multiple) {
            for (let i = 0; i < relatedEntityData.length; i++) {
              entity[relationProp][i] = await this.saveNestedEntities(relatedEntityData[i], currTargetData, relatedRepository);
            }
          } else {
            entity[relationProp] = await this.saveNestedEntities(relatedEntityData, currTargetData, relatedRepository);
          }
        }
      }
    }
    return await repository.save(entity);
  }

  /**
   * Attaches relations to the given row recursively up to the specified depth.
   * @param row The row to attach relations to.
   * @param targetData The target data of the current row.
   * @param selectParams Parameters regulating sample width
   * @param visitedEntities The array of visited entity names.
   * @param maxDepth The maximum depth of relations to fetch. Defaults to Infinity.
   * @returns The row with attached relations.
   */
  private async attachRelations<T = any>(
    row: T, targetData: TargetData, selectParams: ExplorerSelectParams = {},
    visitedEntities: string[] = [], maxDepth = Infinity) {
    if (maxDepth < 0) {
      throw new InternalServerErrorException("maxDepth should be non-negative");
    }
    const colsForSelect = this.getColsForSelect(targetData, selectParams);
    const relations = colsForSelect.referencedCols.map(c => c.property);
    if (!row || !relations.length || maxDepth <= 0) {
      return row;
    }
    const repository = this.connection.getRepository(targetData.entity.target);
    const idProp = targetData.primaryColumn.property;
    visitedEntities.push(targetData.entity.target);
    const withRelations = await repository.findOne({
      select: colsForSelect.colList,
      where: { [idProp]: row[idProp] },
      relations
    });
    for (const k in withRelations) {
      if (relations.indexOf(k) === -1) {
        continue;
      }
      const colData = targetData.entity.columns.find(c => c.property === k);
      const currTargetData = await this.getTargetData(colData.referencedEntityName, {
        section: selectParams.section,
        object: selectParams.object
      });
      if (visitedEntities.includes(currTargetData.entity.target)) {
        continue;
      }
      if (Array.isArray(withRelations[k]) && colData.multiple) {
        for (const key in withRelations[k]) {
          withRelations[k][key] = await this.attachRelations(
            withRelations[k][key], currTargetData, selectParams, visitedEntities.slice(), maxDepth - 1
          );
        }
      } else {
        withRelations[k] = await this.attachRelations(
          withRelations[k], currTargetData, selectParams, visitedEntities.slice(), maxDepth - 1
        );
      }
    }
    return withRelations;
  }


  /**
   * Generates a list of columns to extract.
   * @param targetData The target data of the current row.
   * @param params Parameters regulating sample width
   */
  private getColsForSelect(targetData: TargetData, params: ExplorerSelectParams = {}) {
    const colList: string[] = [];
    const referencedCols: ExplorerColumnEntity[] = [];
    const prefix = params.prefix ? params.prefix : "";
    for (const col of targetData.entity.columns) {
      if (params.section && !col.sectionEnabled) {
        continue;
      }
      if (params.object && !col.objectEnabled) {
        continue;
      }
      if (col.type === "reference") {
        referencedCols.push(col);
      }
      colList.push(prefix + col.property);
    }
    return { colList, referencedCols };
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
    c.name = await this.localeService.createLocalizedStrings(relation.propertyName, `ex_col_prop_${c.id}`);
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
