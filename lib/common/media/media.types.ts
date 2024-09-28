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
import { Response } from "express";

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
  /** This field contains a link to the original file and all its thumbnails */
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
  /** This field defines the possibility to create a duplicate file in WEBP format */
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
  /** The width of the media file in pixels, represented as a string  */
  width: string;
  /** The height of the media file in pixels, represented as a string  */
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
  abstract findByCode(code: string): Promise<Media>;

  abstract findMediaById(id: number, privateMedia?: boolean): Promise<Media>;

  abstract findPublicById(id: number): Promise<Media>;

  abstract findPrivateById(id: number): Promise<Media>;

  abstract remove(id: number): Promise<Media>;

  abstract recreate(id: number): Promise<Media>;

  abstract createOrUpdateMedia(
    file: Buffer,
    type: string,
    code?: string,
    existedEntityId?: number,
    name?: LocalizedString[],
  ): Promise<Media>;

  abstract getMediaPath(
    media: Media,
    format?: string,
    webpSupport?: boolean,
  ): Promise<string>;
}

/**
 * Interface representing the basic functionality for a media management controller.
 */
export interface BasicMediaController {
  /**
   * Handles the uploading of media, saving it to the system, and associating it with a specific type and ID.
   * @param file - The media file to be uploaded.
   * @param type - The type of media being uploaded (e.g., image, video).
   * @param id - An optional ID for associating the media with an existing entity.
   * @returns A promise that resolves to the saved media entity.
   */
  createMedia(
    file: Express.Multer.File,
    type: string,
    id: number,
  ): Promise<Media>;

  /**
   * Retrieves a private media file by its ID, applies any requested format transformations,
   * and sends it as a response.
   * @param res - The HTTP response object used to send the media file.
   * @param id - The ID of the media to be retrieved.
   * @param format - An optional format for transforming the media before sending.
   * @param webp - A boolean indicating whether to convert the media to WebP format.
   * @returns A promise that resolves when the media file is sent.
   */
  getPrivateMedia(
    res: Response,
    id: number,
    format: string,
    webp: boolean,
  ): Promise<void>;

  /**
   * Retrieves a public media file by its ID.
   * @param id - The ID of the media to be retrieved.
   * @returns A promise that resolves to the retrieved media entity.
   */
  getMedia(id: number): Promise<Media>;

  /**
   * Removes a media file by its ID from the system.
   * @param id - The ID of the media to be removed.
   * @returns A promise that resolves to the removed media entity.
   */
  removeMedia(id: number): Promise<Media>;

  /**
   * Recreates a media file by regenerating it.
   * @param id - The ID of the media to be recreated.
   * @returns A promise that resolves to the recreated media entity.
   */
  recreateMedia(id: number): Promise<Media>;
}

/**
 * Options for configuring the MediaModule.
 */
export type MediaModuleOptions = {
  service: Class<MediaManager>;
};
