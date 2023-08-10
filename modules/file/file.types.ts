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

import { Media } from "@media/media.types";
import { LocalizedString } from "@shared/modules/locale/locale.types";
import { Type as Class } from "@nestjs/common/interfaces/type.interface";
import { EntityClassOrSchema } from "@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type";
import { FileManager } from "@files/file.constants";

export interface File {
  id: number;
  code: string;
  name: LocalizedString[];
  path: string;
  public: boolean;
  size: number;
  icon: Media;
  preview: Media;
}

export interface UpsertFileRequest {
  file: Buffer;
  public: boolean;
  code?: string;
  entityIdForPatch?: number;
  entityName?: LocalizedString[];
}

export type FileModuleOptions = {
  service: Class<FileManager>;
  entities: EntityClassOrSchema[];
};
