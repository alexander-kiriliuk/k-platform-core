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

import { ObjectLiteral } from "typeorm";
import { Type as Class } from "@nestjs/common/interfaces/type.interface";
import { LocalizedString } from "../../shared/modules/locale/locale.types";
import { Media } from "../media/media.types";
import { UserRoleEntity } from "../user/entity/user-role.entity";
import { Explorer } from "./explorer.constants";
import { User } from "../user/user.types";
import {
  PageableData,
  PageableParams,
} from "../../shared/modules/pageable/pageable.types";

/**
 * Type representing embedded data types for a column.
 */
export type ColumnDataType =
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "reference"
  | "unknown";

export interface BasicExplorerController {
  getTargetList(): Promise<ExplorerTarget[]>;

  saveTarget(target: ExplorerTarget): Promise<ExplorerTarget>;

  getTarget(
    target: string,
    type: "section" | "object",
    user: User,
  ): Promise<TargetData>;

  getEntity(target: string, id: string, user: User): Promise<ObjectLiteral>;

  getEntityList(
    target: string,
    params: PageableParams,
    user: User,
  ): Promise<PageableData<any>>;

  saveEntity<T>(target: string, body: T, user: User): Promise<T>;

  removeEntity(target: string, id: string, user: User): Promise<ObjectLiteral>;
}

/**
 * Interface representing an explorer target entity.
 */
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
  defaultActionDuplicate: boolean;
  canRead: UserRoleEntity[];
  canWrite: UserRoleEntity[];
  size?: number;
}

/**
 * Interface representing a column in an explorer target entity.
 */
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

/**
 * Interface representing a tab in an explorer target entity.
 */
export interface ExplorerTab {
  id: string;
  name: LocalizedString[];
  priority: number;
  size: object;
  target: ExplorerTarget;
}

/**
 * Interface representing a renderer for an explorer column.
 */
export interface ExplorerColumnRenderer {
  code: string;
  name: LocalizedString[];
  description: LocalizedString[];
  type: Explorer.Variation;
  params: object;
}

/**
 * Interface representing an action in an explorer target entity.
 */
export interface ExplorerAction {
  code: string;
  name: LocalizedString[];
  description: LocalizedString[];
  type: Explorer.Variation;
  priority: number;
  params: object;
}

/**
 * Interface representing the data of an explorer target.
 */
export interface TargetData {
  primaryColumn: ExplorerColumn;
  namedColumn: ExplorerColumn;
  entity: ExplorerTarget;
}

/**
 * Type representing parameters for find explorer targets
 */
export type ExplorerTargetParams = {
  section?: boolean;
  object?: boolean;
  fullRelations?: boolean;
  readRequest?: boolean;
  writeRequest?: boolean;
  checkUserAccess?: User;
};

/**
 * Type representing selection parameters for an explorer entity.
 */
export type ExplorerSelectParams = {
  section?: boolean;
  object?: boolean;
  prefix?: string;
};

/**
 * Options for configuring the Explorer module.
 */
export type ExplorerModuleOptions = {
  service: Class<ExplorerService>;
  controller?: Class<BasicExplorerController>;
  saveHandlers?: Class<EntitySaveHandler>[];
};

/**
 * Interface representing a handler for saving an entity.
 * Such handlers are triggered when entity recording occurs.
 * @template T The type of the entity being handled.
 */
export interface EntitySaveHandler<T = any> {
  handle(target: string, data: T, currentUser: User): T;
}

/**
 * Abstract class representing an explorer service.
 */
export abstract class ExplorerService {
  /**
   * Analyzes the database schema and relationships.
   * Fill data for explorer tables based on that analysis.
   */
  abstract analyzeDatabase(): Promise<void>;

  /**
   * Retrieves paginated entity data with relations.
   * @param {string} target - The name of the target entity or table.
   * @param {PageableParams} [params] - An optional object containing pageable parameters.
   * @param {ExplorerTargetParams} [targetParams] - Parameters to fetch and check entity access.
   * @returns {Promise<PageableData>} A promise that resolves to a PageableData object containing the paginated results.
   */
  abstract getPageableEntityData(
    target: string,
    params?: PageableParams,
    targetParams?: ExplorerTargetParams,
  ): Promise<PageableData>;

  /**
   * Saves or updates an entity, including its nested entities.
   * @param {string} target - The name of the target entity.
   * @param entity - The entity object to be saved or updated.
   * @param {ExplorerTargetParams} [targetParams] - Parameters to fetch and check entity access.
   * @returns {Promise} A promise that resolves to the saved or updated entity.
   */
  abstract saveEntityData<T = any>(
    target: string,
    entity: T,
    targetParams?: ExplorerTargetParams,
  ): Promise<T>;

  /**
   * Removes an entity by its ID.
   * @param {string} target - The name of the entity-target.
   * @param {string | number} id - The ID of the entity to be removed.
   * @param {ExplorerTargetParams} [targetParams] - Parameters to fetch and check entity access.
   * @returns {Promise<ObjectLiteral>} A promise that resolves to the removed entity.
   */
  abstract removeEntity(
    target: string,
    id: string | number,
    targetParams?: ExplorerTargetParams,
  ): Promise<ObjectLiteral>;

  /**
   * Retrieves entity data for the given target and rowId, with relations attached up to the specified depth.
   * @param {string} target - The target entity name.
   * @param {string | number} rowId - The ID of the row to fetch.
   * @param {number} [maxDepth] - The maximum depth of relations to fetch. Defaults to Infinity.
   * @param {ExplorerTargetParams} [targetParams] - Parameters to fetch and check entity access.
   * @returns {Promise<ObjectLiteral>} A promise that resolves to the entity object.
   */
  abstract getEntityData(
    target: string,
    rowId: string | number,
    maxDepth?: number,
    targetParams?: ExplorerTargetParams,
  ): Promise<ObjectLiteral>;

  /**
   * Retrieves target data for the specified target entity name.
   * @param {string} target - The target entity name.
   * @param {ExplorerTargetParams} [targetParams] - Parameters to fetch and check entity access.
   * @returns {Promise<TargetData>} A promise that resolves to the TargetData object.
   */
  abstract getTargetData(
    target: string,
    targetParams?: ExplorerTargetParams,
  ): Promise<TargetData>;

  /**
   * Retrieves a list of all registered targets with their item counts.
   * @returns {Promise<ExplorerTarget[]>} A promise that resolves to an array of ExplorerTarget objects.
   */
  abstract getTargetList(): Promise<ExplorerTarget[]>;

  /**
   * Changes the target data.
   * @param {ExplorerTarget} target - The data of the target entity.
   * @returns {Promise<ExplorerTarget>} A promise that resolves to the changed target entity.
   */
  abstract changeTarget(target: ExplorerTarget): Promise<ExplorerTarget>;
}
