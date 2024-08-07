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

import { Exclude, Expose, Type } from "class-transformer";
import { Type as Class } from "@nestjs/common/interfaces/type.interface";
import { LocalizedString } from "../../shared/modules/locale/locale.types";
import { FileMetadata } from "../file/file.types";
import { MediaEntity } from "./entity/media.entity";

/**
 * Interface representing a media object.
 */
export interface Media {
  id: number;
  code: string;
  name: LocalizedString[];
  type: MediaType;
  files: MediaFile[];
  metadata: FileMetadata;
  tsCreated: Date;
}

/**
 * Interface representing a media type.
 */
export interface MediaType {
  code: string;
  name: string;
  vp6: boolean;
  private: boolean;
  quality: number;
  ext: MediaExt;
  formats: MediaFormat[];
}

/**
 * Interface representing a media format.
 */
export interface MediaFormat {
  code: string;
  name: string;
  width: string;
  height: string;
}

/**
 * Interface representing a media file.
 */
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

/**
 * Interface representing a media extension.
 */
export interface MediaExt {
  code: string;
  name: string;
}

/**
 * Interface representing the request to upsert a media object.
 */
export interface UpsertMediaRequest {
  file: Buffer;
  type: string;
  code?: string;
  entityIdForPatch?: number;
  entityName?: LocalizedString[];
}

/**
 * Data transfer object for media type.
 */
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

/**
 * Data transfer object for media format.
 */
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

/**
 * Data transfer object for media.
 */
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

  @Expose()
  metadata: FileMetadata;

  @Expose()
  tsCreated: Date;
}

/**
 * Data transfer object for media file.
 */
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

/**
 * Abstract class representing the media management service.
 */
export abstract class MediaManager {
  abstract findByCode(code: string): Promise<MediaEntity>;

  abstract findMediaById(
    id: number,
    privateMedia?: boolean,
  ): Promise<MediaEntity>;

  abstract findPublicById(id: number): Promise<MediaEntity>;

  abstract findPrivateById(id: number): Promise<MediaEntity>;

  abstract remove(id: number): Promise<MediaEntity>;

  abstract recreate(id: number): Promise<MediaEntity>;

  abstract createOrUpdateMedia(
    file: Buffer,
    type: string,
    code?: string,
    existedEntityId?: number,
    name?: LocalizedString[],
  ): Promise<MediaEntity>;

  abstract getMediaPath(
    media: Media,
    format?: string,
    webpSupport?: boolean,
  ): Promise<string>;
}

/**
 * Options for configuring the MediaModule.
 */
export type MediaModuleOptions = {
  service: Class<MediaManager>;
};
