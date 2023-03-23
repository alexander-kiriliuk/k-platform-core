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

import { Injectable, Logger } from "@nestjs/common";
import { ExplorerTargetEntity } from "@explorer/src/entity/explorer-target.entity";
import { ExplorerColumnEntity } from "@explorer/src/entity/explorer-column.entity";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { DataSource, EntityMetadata, Repository } from "typeorm";
import { ColumnDataType } from "@explorer/src/explorer";
import { ColumnMetadata } from "typeorm/metadata/ColumnMetadata";
import { RelationMetadata } from "typeorm/metadata/RelationMetadata";
import { LocaleService } from "@shared/locale/locale.service";

@Injectable()
export class ExplorerService {

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(ExplorerTargetEntity)
    private readonly targetRepository: Repository<ExplorerTargetEntity>,
    @InjectRepository(ExplorerColumnEntity)
    private readonly columnRepository: Repository<ExplorerColumnEntity>,
    private readonly logger: Logger,
    private readonly localeService: LocaleService) {
  }

  private get connection() {
    return this.dataSource.manager.connection;
  }

  async analyzeDatabase() {
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
    this.logger.log(`Entities was analyzed`);
  }

  private async saveTarget(target: ExplorerTargetEntity) {
    const t = await this.targetRepository.findOne({ where: { target: target.target } });
    if (t) {
      this.logger.log(`Entity ${target.target} was exist, skip`);
      return;
    }
    await this.targetRepository.save(target);
    this.logger.log(`Entity ${target.target} was created`);
  }

  private async saveColumn(column: ExplorerColumnEntity) {
    const c = await this.columnRepository.findOne({ where: { id: column.id } });
    if (c) {
      this.logger.log(`Column ${column.name} was exist, skip`);
      return;
    }
    await this.columnRepository.save(column);
    this.logger.log(`Column ${column.name} was created`);
  }

  private async setColumnProperties(c: ExplorerColumnEntity, relation: RelationMetadata, target: ExplorerTargetEntity) {
    c.target = target;
    c.id = relation.propertyPath;
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
