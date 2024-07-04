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

import { Type, Type as Class } from "@nestjs/common/interfaces/type.interface";
import { DynamicModule } from "@nestjs/common/interfaces/modules/dynamic-module.interface";
import { ForwardReference } from "@nestjs/common/interfaces/modules/forward-reference.interface";
import { ObjectLiteral } from "typeorm";
import {
  XdbExportService,
  XdbImportService,
} from "./xml-data-bridge.constants";
import { User } from "../user/user.types";

/**
 * Interface representing an XML data bridge request.
 */
export interface XdbRequest {
  target: string;
  id: string;
}

/**
 * Type representing a row data value in the XML data bridge.
 */
export type XdbRowDataValue = {
  attrs?: {
    key?: string;
    uri?: string;
    mode?: "push";
  };
  value?: string;
  values?: string[];
};

/**
 * Type representing a row of data in the XML data bridge.
 */
export type XdbRowData = {
  [key: string]: XdbRowDataValue;
};

/**
 * Type representing a media row in the XML data bridge.
 */
export type MediaRow = {
  name: XdbRowDataValue;
  code: string;
  type: string;
  file: string;
};

/**
 * Type representing a file row in the XML data bridge.
 */
export type FileRow = {
  name: string;
  code: string;
  public: boolean;
  file: string;
};

/**
 * Type representing an action in the XML data bridge.
 */
export type XdbAction = {
  action: "InsertUpdate" | "Media" | "File" | "Remove" | "Include" | "Query";
  attrs: {
    target?: string;
    read?: string;
    content?: string;
  };
  rows: Array<XdbRowData | FileRow>;
};

/**
 * Type representing an XML data bridge object.
 */
export type XdbObject = {
  schema: XdbAction[];
};

/**
 * Options for configuring the XmlDataBridgeModule.
 */
export type XdbModuleOptions = {
  importService: Class<XdbImportService>;
  exportService: Class<XdbExportService>;
  imports: Array<
    Type<any> | DynamicModule | Promise<DynamicModule> | ForwardReference
  >;
};

/**
 * Type representing export parameters for the XML data bridge.
 */
export type XdbExportParams = {
  target: string;
  id: string;
  depth: number;
  useFiles: boolean;
  excludeProperties: string[];
  user: User;
};

/**
 * Type representing the export DTO for the XML data bridge.
 */
export type XdbExportDto = {
  file: string;
};

/**
 * Type representing a decomposed entity in the XML data bridge.
 */
export type XdbDecomposedEntity = {
  metadata: { type: string; fieldName: string; path: string };
  data: ObjectLiteral | Array<ObjectLiteral>;
};
