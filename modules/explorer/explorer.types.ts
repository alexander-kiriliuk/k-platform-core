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

import { LocalizedString } from "@shared/modules/locale/locale.types";
import { PageableData, PageableParams } from "@shared/modules/pageable/pageable.types";
import { ObjectLiteral } from "typeorm";
import { Type as Class } from "@nestjs/common/interfaces/type.interface";
import { EntityClassOrSchema } from "@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type";
import { Explorer } from "@explorer/explorer.constants";
import { Media } from "@media/media.types";

export type ColumnDataType = "string" | "number" | "boolean" | "date" | "reference" | "unknown";

export interface ExplorerTarget {
  target: string;
  tableName: string;
  name: LocalizedString[];
  description: LocalizedString[];
  icon: Media;
  columns: ExplorerColumn[];
  actions: ExplorerAction[];
  defaultActionCreate: boolean;
  defaultActionSave: boolean;
  defaultActionDelete: boolean;
  size?: number;
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
  virtual: boolean;
  multiple: boolean;
  named: boolean;
  referencedTableName: string;
  referencedEntityName: string;
  sectionPriority: number;
  objectPriority: number;
  sectionEnabled: boolean;
  objectEnabled: boolean;
  sectionVisibility: boolean;
  objectVisibility: boolean;
  sectionRenderer: ExplorerColumnRenderer;
  objectRenderer: ExplorerColumnRenderer;
  tab: ExplorerTab;
}

export interface ExplorerTab {
  id: string;
  name: LocalizedString[];
  priority: number;
  size: object;
  target: ExplorerTarget;
}

export class ExplorerColumnRenderer {
  code: string;
  name: LocalizedString[];
  description: LocalizedString[];
  type: Explorer.Variation;
  params: object;
}

export class ExplorerAction {
  code: string;
  name: LocalizedString[];
  description: LocalizedString[];
  type: Explorer.Variation;
  priority: number;
  params: object;
}

export interface TargetData {
  primaryColumn: ExplorerColumn;
  namedColumn: ExplorerColumn;
  entity: ExplorerTarget;
}

export type ExplorerTargetParams = {
  section?: boolean,
  object?: boolean,
  fullRelations?: boolean
};

export type ExplorerSelectParams = {
  section?: boolean,
  object?: boolean,
  prefix?: string
};

export type ExplorerModuleOptions = {
  service: Class<ExplorerService>;
  entities: EntityClassOrSchema[];
};

export abstract class ExplorerService {

  abstract analyzeDatabase(): Promise<void>;

  abstract getPageableEntityData(target: string, params?: PageableParams): Promise<PageableData>;

  abstract saveEntityData<T = any>(target: string, entity: T): Promise<T>;

  abstract removeEntity(target: string, id: string | number): Promise<ObjectLiteral>;

  abstract getEntityData(target: string, rowId: string | number, maxDepth?: number): Promise<ObjectLiteral>;

  abstract getTargetData(target: string, params?: ExplorerTargetParams): Promise<TargetData>;

  abstract getTargetList(): Promise<ExplorerTarget[]>;

  abstract changeTarget(target: ExplorerTarget): Promise<ExplorerTarget>;

}
