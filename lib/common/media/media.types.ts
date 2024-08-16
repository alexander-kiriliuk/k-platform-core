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
  /** This field contains the identification number of the file  */
  id: number;
  /** This field contains a unique character identifier */
  code: string;
  /** This field contains the name of the file in all languages involved */
  name: LocalizedString[];
  /** This field contains a list of unique settings and functions that the file contains */
  type: MediaType;
  /** This field contains the media file and all copies and thumbnails */
  files: MediaFile[];
  /** This field contains a link to the meta data container */
  metadata: FileMetadata;
  /** This field contains the date the file was created */
  tsCreated: Date;
}

/**
 * Interface representing a media type.
 */
export interface MediaType {
  /** A unique code representing the media file type */
  code: string;
  /** This field contains a unique character identifier */
  name: string;
  /** Indicates whether the media type supports the VP6 video codec */
  vp6: boolean;
  /** This field indicates the type of access to the file, public or private */
  private: boolean;
  /** A numeric value reflecting the quality level of the media (defines the compression rate or overall quality) */
  quality: number;
  /** A file extension associated with the media type and which defines the file format  */
  ext: MediaExt;
  /** An array of supported media formats for this media type */
  formats: MediaFormat[];
}

/**
 * Interface representing a media format.
 */
export interface MediaFormat {
  /** This field contains a unique character identifier */
  code: string;
  /** This field contains the name of the media format */
  name: string;
  /** The width of the media file in pixels, represented as a string (Example: '1920', '1280') */
  width: string;
  /** The height of the media file in pixels, represented as a string (Example values: '1080', '720') */
  height: string;
}

/**
 * Interface representing a media file.
 */
export interface MediaFile {
  /** A unique code or identifier for the media file*/
  id: number;
  /** This field contains a unique character identifier */
  code: string;
  /** This field contains the name of the media file */
  name: string;
  /** The width of the media file in pixels */
  width: number;
  /** The height of the media file in pixels */
  height: number;
  /** The size of the media file in bytes */
  size: number;
  /** The format of the media file, represented by the MediaFormat type */
  format: MediaFormat;
  media: Media;
}

/**
 * Interface representing a media extension.
 */
export interface MediaExt {
  /** This field contains a unique character identifier */
  code: string;
  /** A unique code or identifier for the media file*/
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
