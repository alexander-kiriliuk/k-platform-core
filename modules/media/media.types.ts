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
import { Exclude, Expose, Type } from "class-transformer";

export interface Media {
  id: number;
  code: string;
  name: LocalizedString[];
  type: MediaType;
  files: MediaFile[];
}

export interface MediaType {
  code: string;
  name: string;
  vp6: boolean;
  private: boolean;
  quality: number;
  ext: MediaExt;
  formats: MediaFormat[];
}

export interface MediaFormat {
  code: string;
  name: string;
  width: string;
  height: string;
}

export interface MediaFile {
  id: number;
  code: string;
  name: string;
  width: number;
  height: number;
  size: number;
  format: MediaFormat;
  media: Media;
}

export interface MediaExt {
  code: string;
  name: string;
}

export interface UpsertMediaRequest {
  file: Buffer;
  type: string;
  code?: string;
  entityIdForPatch?: number;
  entityName?: LocalizedString[];
}

export class MediaTypeDto implements MediaType {

  @Expose()
  code: string;

  @Expose()
  ext: MediaExt;

  @Expose()
  @Type(() => MediaFormatDto)
  formats: MediaFormatDto[];

  @Expose()
  name: string;

  @Expose()
  private: boolean;

  @Expose()
  vp6: boolean;

  @Expose()
  quality: number;

}

export class MediaFormatDto implements MediaFormat {

  @Expose()
  code: string;

  @Expose()
  height: string;

  @Expose()
  name: string;

  @Expose()
  width: string;

}

export class MediaDto implements Media {

  @Expose()
  id: number;

  @Expose()
  code: string;

  @Expose()
  name: LocalizedString[];

  @Expose()
  @Type(() => MediaTypeDto)
  type: MediaType;

  @Expose()
  @Type(() => MediaFileDto)
  files: MediaFile[];

}

export class MediaFileDto implements MediaFile {

  @Expose()
  id: number;

  @Expose()
  code: string;

  @Expose()
  @Type(() => MediaFormatDto)
  format: MediaFormatDto;

  @Expose()
  height: number;

  @Exclude()
  media: Media;

  @Expose()
  name: string;

  @Expose()
  size: number;

  @Expose()
  width: number;

}
