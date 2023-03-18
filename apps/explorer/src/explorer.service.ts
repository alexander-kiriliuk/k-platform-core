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
import { DataSource, Repository } from "typeorm";
import { ColumnDataType } from "@explorer/src/explorer";

@Injectable()
export class ExplorerService {

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(ExplorerTargetEntity)
    private readonly targetRepository: Repository<ExplorerTargetEntity>,
    @InjectRepository(ExplorerColumnEntity)
    private readonly columnRepository: Repository<ExplorerColumnEntity>,
    private readonly logger: Logger) {
  }

  private get connection() {
    return this.dataSource.manager.connection;
  }

  async runAnalyzer() {
    this.logger.log(`Analyze entities, total count: ${this.connection.entityMetadatas.length}`);
    for (const md of this.connection.entityMetadatas) {
      this.logger.log(md.tableName);
    }
  }

  private getColumnType(type: string): ColumnDataType {
    switch (type) {
      case "string":
      case "text":
      case "uuid":
      case "simple":
      case "varchar":
      case "char":
        return "string";
      case "int":
      case "int2":
      case "int4":
      case "int8":
      case "float4":
      case "float8":
      case "numeric":
        return "number";
      case "bool":
        return "boolean";
      case "timestamp":
      case "timestamptz":
      case "date":
        return "date";
      default:
        return "unknown";
    }
  }

}
