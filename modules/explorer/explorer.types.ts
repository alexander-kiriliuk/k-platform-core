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

import { MediaEntity } from "@media/entity/media.entity";
import { ExplorerColumnEntity } from "./entity/explorer-column.entity";
import { LocalizedString } from "@shared/modules/locale/locale.types";
import { ExplorerTargetEntity } from "./entity/explorer-target.entity";
import { PageableData, PageableParams } from "@shared/modules/pageable/pageable.types";
import { ObjectLiteral } from "typeorm";
import { Type as Class } from "@nestjs/common/interfaces/type.interface";
import { EntityClassOrSchema } from "@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type";

export type ColumnDataType = "string" | "number" | "boolean" | "date" | "reference" | "unknown";

export interface ExplorerTarget {
  target: string;
  tableName: string;
  name: LocalizedString[];
  description: LocalizedString[];
  icon: MediaEntity;
  columns: ExplorerColumnEntity[];
}

export interface ExplorerColumn {
  id: string;
  property: string;
  name: LocalizedString[];
  description: LocalizedString[];
  target: ExplorerTarget;
  primary: boolean;
  unique: boolean;
  type: ColumnDataType | string;
  multiple: boolean;
  referencedTableName: string;
  referencedEntityName: string;
}

export interface ExplorerEntityRequest {
  id: string;
  target: string;
}

export interface ExplorerPagedEntityRequest {
  params?: PageableParams;
  target: string;
}

export interface ExplorerSaveEntityRequest<T = any> {
  target: string;
  data: T;
}

export interface ExplorerRemoveEntityRequest {
  target: string;
  id: string | number;
}

export interface TargetData {
  primaryColumn: ExplorerColumnEntity;
  entity: ExplorerTargetEntity;
}

export interface EntityData<T = any> {
  data: T;
  entity: ExplorerTargetEntity;
}

export abstract class ExplorerService {

  abstract analyzeDatabase(): Promise<void>;

  abstract getPageableEntityData(target: string, params?: PageableParams): Promise<PageableData>;

  abstract saveEntityData<T = any>(target: string, entity: T): Promise<T>;

  abstract removeEntity(target: string, id: string | number): Promise<ObjectLiteral>;

  abstract getEntityData(target: string, rowId: string | number, maxDepth?: number): Promise<ObjectLiteral>;

  abstract getTargetData(target: string): Promise<TargetData>;

}

export type ExplorerModuleOptions = {
  service: Class<ExplorerService>;
  entities: EntityClassOrSchema[];
};
