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
import { ExplorerTargetEntity } from "@explorer/src/entity/explorer-target.entity";
import { ExplorerColumnEntity } from "@explorer/src/entity/explorer-column.entity";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { DataSource, EntityMetadata, In, Repository } from "typeorm";
import { ColumnDataType, EntityData, TargetData } from "@explorer/src/explorer.types";
import { ColumnMetadata } from "typeorm/metadata/ColumnMetadata";
import { RelationMetadata } from "typeorm/metadata/RelationMetadata";
import { LocaleService } from "@shared/modules/locale/locale.service";
import { LOGGER } from "@shared/modules/log/log.constants";
import { NotFoundMsException } from "@shared/exceptions/not-found-ms.exception";

@Injectable()
export class ExplorerService {

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

  async getEntityData(target: string, rowId: string | number): Promise<EntityData> {
    const targetData = await this.getTargetData(target);
    if (!targetData) {
      throw new NotFoundMsException(`Target entity not found: ${target}`);
    }
    const repository = this.connection.getRepository(targetData.entity.target);
    let queryBuilder = repository.createQueryBuilder(targetData.entity.target);
    queryBuilder.where(`${targetData.entity.target}.${targetData.primaryColumn.property} = :rowId`, { rowId });
    for (const column of targetData.entity.columns) {
      if (column.type === "reference" && column.multiple) {
        queryBuilder.leftJoinAndSelect(`${targetData.entity.target}.${column.property}`, column.property);
      }
    }
    const row = await queryBuilder.getOne();
    if (!row) {
      throw new NotFoundMsException(`Row with ID ${rowId} not found in table ${target}`);
    }
    const rowWithRelations = await this.includeRelations(row, targetData.entity.columns, []);
    return { entity: targetData.entity, data: rowWithRelations };
  }

  private async includeRelations<T = any>(row: T, columns: ExplorerColumnEntity[], visitedEntities: string[]): Promise<T> {
    const rowData = { ...row };
    for (const column of columns) {
      if (column.type === "reference") {
        const relTargetData = await this.getTargetData(column.referencedEntityName);
        const relRepository = this.connection.getRepository(column.referencedEntityName);
        const idProperty = relTargetData.primaryColumn.property;
        if (column.multiple) {
          const ids = [];
          for (let rowElementKey in row[column.property]) {
            ids.push(row[column.property][rowElementKey][relTargetData.primaryColumn.property]);
          }
          const referenceColumns = relTargetData.entity.columns.filter(col => col.type === "reference").map(col => col.property);
          const relatedEntities = await relRepository.find({
            where: { [idProperty]: In(ids) },
            relations: referenceColumns || [],
          });
          if (!relatedEntities || relatedEntities.length === 0) {
            rowData[column.property] = null;
            continue;
          }
          rowData[column.property] = [];
          for (const relatedEntity of relatedEntities) {
            if (visitedEntities.includes(column.referencedEntityName)) {
              rowData[column.property].push(relatedEntity);
            } else {
              const relatedTargetEntity = await this.targetRep.findOne({
                where: { target: column.referencedEntityName },
                relations: ["columns"],
              });
              if (relatedTargetEntity) {
                visitedEntities.push(column.referencedEntityName);
                const withRel = await this.includeRelations(relatedEntity, relatedTargetEntity.columns, visitedEntities);
                rowData[column.property].push(withRel);
                visitedEntities.pop();
              } else {
                rowData[column.property].push(relatedEntity);
              }
            }
          }
        } else {
          const idVal = rowData[column.property];
          const relatedEntity = await relRepository.findOne({ where: { [idProperty]: idVal } });
          if (!relatedEntity) {
            rowData[column.property] = rowData[column.property];
            continue;
          }
          if (visitedEntities.includes(column.referencedEntityName)) {
            rowData[column.property] = relatedEntity;
          } else {
            const relatedTargetEntity = await this.targetRep.findOne({
              where: { target: column.referencedEntityName },
              relations: ["columns"],
            });
            if (relatedTargetEntity) {
              visitedEntities.push(column.referencedEntityName);
              /*const referenceColumns = relatedTargetEntity.columns.filter(col => col.type === "reference").map(col => col.property);
              const idProp = relatedEntity[relTargetData.primaryColumn.property];
              const withRel = await relRepository.findOne({ where: { [idProp]: relatedEntity[idProp] }, relations: referenceColumns });*/
              rowData[column.property] = await this.includeRelations(relatedEntity, relatedTargetEntity.columns, visitedEntities);
              visitedEntities.pop();
            } else {
              rowData[column.property] = relatedEntity;
            }
          }
        }
      }
    }
    return rowData;
  }

  private async getTargetData(target: string): Promise<TargetData> {
    const entity = await this.targetRep.findOne({ where: { target }, relations: ["columns"] });
    if (!entity) {
      return null;
    }
    const primaryColumn = entity.columns.find(c => c.primary === true);
    return { entity, primaryColumn };
  }

  private async saveTarget(target: ExplorerTargetEntity) {
    const t = await this.targetRep.findOne({ where: { target: target.target } });
    if (t) {
      this.logger.verbose(`Entity ${target.target} already exists, skipping`);
      return;
    }
    await this.targetRep.save(target);
    this.logger.verbose(`Entity ${target.target} was created`);
  }

  private async saveColumn(column: ExplorerColumnEntity) {
    const c = await this.columnRep.findOne({ where: { id: column.id } });
    if (c) {
      this.logger.verbose(`Column ${column.id} already exists, skipping`);
      return;
    }
    await this.columnRep.save(column);
    this.logger.verbose(`Column ${column.id} was created`);
  }

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

  private isColumnUnique(md: EntityMetadata, column: ColumnMetadata) {
    for (const uniq of md.uniques) {
      if (uniq.columns.find(col => col.propertyName === column.propertyName) !== undefined) {
        return true;
      }
    }
    return false;
  }

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
