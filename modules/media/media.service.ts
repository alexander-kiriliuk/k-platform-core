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

import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException
} from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { FilesUtils } from "@shared/utils/files.utils";
import { LOGGER } from "@shared/modules/log/log.constants";
import { CacheService } from "@shared/modules/cache/cache.types";
import { LocalizedString } from "@shared/modules/locale/locale.types";
import { LocalizedStringEntity } from "@shared/modules/locale/entity/localized-string.entity";
import {
  DEFAULT_MEDIA_QUALITY,
  MEDIA_TYPE_RELATIONS,
  ReservedMediaExt,
  ReservedMediaFormat
} from "@media/media.constants";
import { MediaEntity } from "@media/entity/media.entity";
import { MediaTypeEntity } from "@media/entity/media-type.entity";
import { MediaFormatEntity } from "@media/entity/media-format.entity";
import { MediaFileEntity } from "@media/entity/media-file.entity";
import { Media, MediaManager } from "@media/media.types";
import { MediaConfig } from "./gen-src/media.config";
import * as imageminMozjpeg from "imagemin-mozjpeg";
import { createCanvas } from "canvas"; // fix canvas compatibility with Windows OS
import * as sharp from "sharp";
import * as imagemin from "imagemin";
import * as fs from "fs";
import * as path from "path";
import imageminPngquant from "imagemin-pngquant";
import { NumberUtils } from "@shared/utils/number.utils";

createCanvas(0, 0);
import createDirectoriesIfNotExist = FilesUtils.createDirectoriesIfNotExist;

/**
 * `MediaService` is a service responsible for managing media files, including
 * uploading, resizing, optimizing, and removing images.
 */
@Injectable()
export class MediaService extends MediaManager {

  constructor(
    @Inject(LOGGER) protected readonly logger: Logger,
    @InjectRepository(MediaEntity)
    private readonly mediaRep: Repository<MediaEntity>,
    @InjectRepository(MediaTypeEntity)
    private readonly mediaTypeRep: Repository<MediaTypeEntity>,
    @InjectRepository(MediaFormatEntity)
    private readonly mediaFormatRep: Repository<MediaFormatEntity>,
    @InjectRepository(MediaFileEntity)
    private readonly mediaFileRep: Repository<MediaFileEntity>,
    private readonly cacheService: CacheService) {
    super();
  }

  /**
   * Finds a media entity by code.
   * @param code - The code of the media entity.
   * @returns The found media entity.
   */
  async findByCode(code: string): Promise<MediaEntity> {
    return await this.createBasicFindQb()
      .where("media.code = :code", { code })
      .getOne();
  }

  /**
   * Finds a media entity by ID with public access.
   * @param id - The ID of the media entity.
   * @returns The found media entity.
   */
  async findPublicById(id: number): Promise<MediaEntity> {
    return this.findMediaById(id, false);
  }

  /**
   * Finds a media entity by ID with private access.
   * @param id - The ID of the media entity.
   * @returns The found private media entity.
   */
  async findPrivateById(id: number): Promise<MediaEntity> {
    return this.findMediaById(id, true);
  }

  /**
   * Removes a media entity by ID and cleans up related files.
   * @param id - The ID of the media entity.
   * @returns The removed media entity.
   */
  async remove(id: number): Promise<MediaEntity> {
    const media = await this.findMediaById(id);
    const dir = path.join(
      media.type.private ? await this.getPrivateDir() : await this.getPublicDir(),
      media.id.toString()
    );
    await this.mediaRep.manager.transaction(async transactionManager => {
      await transactionManager.remove(media.files);
      await transactionManager.remove(media);
      await fs.promises.rm(dir, { recursive: true, force: true }).catch(err => {
        throw new InternalServerErrorException(`Failed to delete directory: ${dir}`, err);
      });
    });
    this.logger.log(`Media with ID ${id} removed`);
    return media;
  }

  /**
   * Recreate a media entity, generate new files and data.
   * @param id - The ID of the media entity.
   * @returns The recreated media entity.
   * @throws NotFoundException if the media entity is not found.
   * @throws BadRequestException if the related media is not found.
   */
  async recreate(id: number): Promise<MediaEntity> {
    const media = await this.findMediaById(id);
    if (!media) {
      throw new NotFoundException(`Media with ID ${id} not found`);
    }
    const dir = path.join(
      media.type.private ? await this.getPrivateDir() : await this.getPublicDir(),
      media.id.toString()
    );
    this.logger.log(`Try to recreate media with ID ${id}`);
    for (const file of media.files) {
      if (file.format.code !== ReservedMediaFormat.ORIGINAL) {
        continue;
      }
      const oldFilePath = path.normalize(`${dir}/${file.name}.${media.type.ext.code}`);
      if (!fs.existsSync(oldFilePath)) {
        throw new BadRequestException(`Related file was not found`);
      }
      const oldFile = await fs.promises.readFile(oldFilePath);
      const newMedia = await this.createOrUpdateMedia(oldFile, media.type.code, media.code, media.id);
      this.logger.log(`Media with ID ${id} recreated`);
      return newMedia;
    }
    this.logger.error(`Media with ID ${id} not recreated`);
    return media;
  }

  /**
   * Uploads and processes a media file, create or update related entity.
   * @param file - Buffer of media file.
   * @param type - The media type.
   * @param code - Specific identification code for media entity.
   * @param existedEntityId - ID of media entity for patch.
   * @param name - localized name for media entity.
   * @returns The uploaded and processed media entity.
   */
  async createOrUpdateMedia(
    file: Buffer,
    type: string,
    code?: string,
    existedEntityId?: number,
    name?: LocalizedString[]): Promise<MediaEntity> {
    const mediaType = await this.getMediaType(type);
    let entity: MediaEntity = undefined;
    await this.mediaRep.manager.transaction(async transactionManager => {
      if (existedEntityId) {
        entity = await this.findMediaById(existedEntityId);
        if (!entity) {
          throw new BadRequestException(`Cannot patch media with ID ${existedEntityId}, because that not exists`);
        }
        const dir = path.join(
          entity.type.private ? await this.getPrivateDir() : await this.getPublicDir(),
          entity.id.toString()
        );
        await fs.promises.rm(dir, { recursive: true, force: true }).catch(err => {
          throw new InternalServerErrorException(`Failed to delete directory: ${dir}`, err);
        });
      } else {
        entity = await this.createMediaEntity(mediaType);
      }
      entity.name = name as LocalizedStringEntity[];
      entity.code = code;
      const outputPath = await this.createMediaDirectory(mediaType, entity.id.toString());
      const formatsToProcess = await this.getFormatsToProcess(mediaType);
      entity.files = await this.processFormats(
        file, formatsToProcess, mediaType, entity, outputPath
      );
      await transactionManager.save(entity);
    });
    this.logger.log(`${!existedEntityId ? `Created` : `Updated`} media with ID ${entity.id}`);
    entity.files.forEach(f => delete f.media);  // remove inverse side ref
    return entity;
  }

  /**
   * Get the media file path based on the media object, format, and WebP support.
   * @param media - The media object to get the file path for.
   * @param format - The format of the media file (default is 'ORIGINAL').
   * @param webpSupport - A boolean indicating whether the client supports WebP format (default is false).
   * @returns The full path to the media file including the file extension.
   */
  async getMediaPath(media: Media, format = ReservedMediaFormat.ORIGINAL, webpSupport = false) {
    let mediaPath = `${media.type.private ? await this.getPrivateDir() : await this.getPublicDir()}/${media.id}/`;
    const file = media.files.find(v => v.format.code === format);
    mediaPath += file.name;
    if (webpSupport && media.type.vp6) {
      mediaPath += ".webp";
    } else {
      mediaPath += `.${media.type.ext.code}`;
    }
    return mediaPath;
  }

  /**
   * Retrieves the media type based on the given type code.
   * @param type - The media type code.
   * @returns The MediaTypeEntity instance.
   * @throws BadRequestException if the media type is not found.
   */
  private async getMediaType(type: string): Promise<MediaTypeEntity> {
    const mediaType = await this.mediaTypeRep.findOne({
      where: { code: type },
      relations: MEDIA_TYPE_RELATIONS
    });
    if (!mediaType) {
      throw new BadRequestException("Media type not found");
    }
    return mediaType;
  }

  /**
   * Creates a new media entity with the provided media type.
   * @param mediaType - The MediaTypeEntity instance.
   * @returns The created MediaEntity instance.
   */
  private async createMediaEntity(mediaType: MediaTypeEntity): Promise<MediaEntity> {
    const entity = new MediaEntity();
    entity.type = mediaType;
    entity.name = [];
    return this.mediaRep.save(entity);
  }

  /**
   * Creates a media directory for the given media type and media entity ID.
   * @param mediaType - The MediaTypeEntity instance.
   * @param mediaEntityId - The media entity ID.
   * @returns The path to the created media directory.
   */
  private async createMediaDirectory(mediaType: MediaTypeEntity, mediaEntityId: string): Promise<string> {
    const dir = path.join(mediaType.private ? await this.getPrivateDir() : await this.getPublicDir(), mediaEntityId);
    await createDirectoriesIfNotExist(dir);
    return dir;
  }

  /**
   * Retrieves the media formats that need to be processed for the given media type.
   * @param mediaType - The MediaTypeEntity instance.
   * @returns An array of MediaFormatEntity instances to be processed.
   */
  private async getFormatsToProcess(mediaType: MediaTypeEntity): Promise<MediaFormatEntity[]> {
    mediaType.formats = mediaType.formats.filter(
      f => f.code !== ReservedMediaFormat.ORIGINAL && f.code !== ReservedMediaFormat.THUMB
    );
    const thumbFormat = await this.getThumbFormat();
    const originalFormat = await this.getOriginalFormat();
    if (mediaType.ext.code === ReservedMediaExt.SVG) {
      return [originalFormat, ...mediaType.formats];
    }
    return [thumbFormat, originalFormat, ...mediaType.formats];
  }

  /**
   * Processes the media formats for a given file, media type, and media entity.
   * @param file - The deserialized media file.
   * @param formats - The media formats to process.
   * @param mediaType - The MediaTypeEntity instance.
   * @param mediaEntity - The MediaEntity instance.
   * @param outputPath - The output path for the processed files.
   * @returns An array of MediaFileEntity instances.
   */
  private async processFormats(
    file: Buffer,
    formats: MediaFormatEntity[],
    mediaType: MediaTypeEntity,
    mediaEntity: MediaEntity,
    outputPath: string
  ): Promise<MediaFileEntity[]> {
    const processingPromises = formats.map(async (format) => {
      const quality = mediaType.quality || DEFAULT_MEDIA_QUALITY;
      let imgBuffer = file;
      if (format.code !== ReservedMediaFormat.ORIGINAL && mediaType.ext.code !== ReservedMediaExt.SVG) {
        imgBuffer = await this.resizeImage(file, format);
        imgBuffer = await this.optimizeImage(imgBuffer, mediaType.ext.code, quality);
      }
      const fileName = `${NumberUtils.generateRandomInt()}-${format.code}`;
      const resizedImagePath = `${outputPath}/${fileName}.${mediaType.ext.code}`;
      await fs.promises.writeFile(resizedImagePath, imgBuffer);
      const resizedMediaFile = await this.createMediaFileEntity(imgBuffer, format, mediaEntity, fileName);
      if (mediaType.vp6) {
        const webpImage = await sharp(imgBuffer).webp({ quality }).toBuffer();
        const webpImagePath = `${outputPath}/${fileName}.webp`;
        await fs.promises.writeFile(webpImagePath, webpImage);
        const webpMediaFile = await this.createMediaFileEntity(webpImage, format, mediaEntity, fileName);
        return [await this.mediaFileRep.save(resizedMediaFile), await this.mediaFileRep.save(webpMediaFile)];
      } else {
        return [await this.mediaFileRep.save(resizedMediaFile)];
      }
    });
    const savedMediaFiles = await Promise.all(processingPromises);
    return savedMediaFiles.flat();
  }

  /**
   * Optimizes the image based on the provided file extension and quality.
   * @param buffer - The image buffer.
   * @param fileExt - The file extension.
   * @param quality - The image quality.
   * @returns The optimized image buffer.
   */
  private async optimizeImage(buffer: Buffer, fileExt: string, quality: number) {
    try {
      switch (fileExt) {
        case "png":
          return await imagemin.buffer(buffer, {
            plugins: [imageminPngquant({ quality: this.getPngQualityRange(quality) })]
          });
        case "jpg":
        case "jpeg":
          return await imagemin.buffer(buffer, {
            plugins: [imageminMozjpeg({ quality })]
          });
      }
    } catch (e) {
      this.logger.error(`Image-optimize error`, e);
      return buffer;
    }
  }

  /**
   * Retrieves the PNG quality range based on the provided quality value.
   * @param quality - The image quality.
   * @returns A tuple containing the minimum and maximum quality values.
   */
  private getPngQualityRange(quality: number): [number, number] {
    const minQuality = Math.max(0, quality - 10) / 100;
    const maxQuality = Math.min(100, quality + 10) / 100;
    return [minQuality, maxQuality];
  }

  /**
   * Resizes the image based on the provided media format.
   * @param buffer - The image buffer.
   * @param format - The MediaFormatEntity instance.
   * @returns The resized image buffer.
   */
  private async resizeImage(buffer: Buffer, format: MediaFormatEntity): Promise<Buffer> {
    const originalMetadata = await sharp(buffer).metadata();
    const originalWidth = originalMetadata.width;
    const originalHeight = originalMetadata.height;
    let targetWidth: number | null = parseInt(format.width) || null;
    let targetHeight: number | null = parseInt(format.height) || null;
    if (targetWidth > originalWidth) {
      targetWidth = originalWidth;
    }
    if (targetHeight > originalHeight) {
      targetHeight = originalHeight;
    }
    if (!targetWidth && !targetHeight) {
      targetWidth = originalWidth;
      targetHeight = originalHeight;
    } else if (targetWidth && !targetHeight) {
      targetHeight = Math.round((originalHeight / originalWidth) * targetWidth);
    } else if (!targetWidth && targetHeight) {
      targetWidth = Math.round((originalWidth / originalHeight) * targetHeight);
    } else {
      const widthRatio = targetWidth / originalWidth;
      const heightRatio = targetHeight / originalHeight;
      const minRatio = Math.min(widthRatio, heightRatio);
      targetWidth = Math.round(originalWidth * minRatio);
      targetHeight = Math.round(originalHeight * minRatio);
    }
    return await sharp(buffer)
      .resize(targetWidth, targetHeight)
      .toBuffer();
  }

  /**
   * Creates a MediaFileEntity instance for the provided image, format, media entity, and file name.
   * @param image - The image buffer.
   * @param format - The MediaFormatEntity instance.
   * @param mediaEntity - The MediaEntity instance.
   * @param fileName - The file name.
   * @returns The created MediaFileEntity instance.
   */
  private async createMediaFileEntity(
    image: Buffer,
    format: MediaFormatEntity,
    mediaEntity: MediaEntity,
    fileName: string
  ): Promise<MediaFileEntity> {
    const metadata = await sharp(image).metadata();
    const mediaFile = new MediaFileEntity();
    mediaFile.name = fileName;
    mediaFile.format = format;
    mediaFile.media = mediaEntity;
    mediaFile.width = metadata.width;
    mediaFile.height = metadata.height;
    mediaFile.size = image.length;
    return mediaFile;
  }

  /**
   * Finds a media entity by ID with the specified access level (public or private).
   * @param id - The ID of the media entity.
   * @param privateMedia - A boolean flag indicating whether to search for private media entities (default: false).
   * @returns The found media entity.
   * @throws NotFoundException if the media entity is not found.
   */
  private async findMediaById(id: number, privateMedia: boolean = undefined): Promise<MediaEntity> {
    const qb = this.createBasicFindQb()
      .where("media.id = :id", { id });
    if (privateMedia !== undefined) {
      qb.andWhere(`type.private = ${privateMedia}`);
    }
    const entity = await qb.getOne();
    if (!entity) {
      throw new NotFoundException(`Media with ID ${id} not found`);
    }
    return entity;
  }

  /**
   * Creates a basic query builder for finding media entities.
   * @returns The created query builder.
   */
  private createBasicFindQb() {
    return this.mediaRep.createQueryBuilder("media")
      .leftJoinAndSelect("media.type", "type")
      .leftJoinAndSelect("type.formats", "formats")
      .leftJoinAndSelect("type.ext", "ext")
      .leftJoinAndSelect("media.files", "files")
      .leftJoinAndSelect("files.format", "format")
      .leftJoinAndSelect("media.name", "name")
      .leftJoinAndSelect("name.lang", "lang");
  }

  private async getPublicDir() {
    const dir = process.cwd() + await this.cacheService.get(MediaConfig.PUBLIC_DIR);
    return path.normalize(dir);
  }

  private async getPrivateDir() {
    const dir = process.cwd() + await this.cacheService.get(MediaConfig.PRIVATE_DIR);
    return path.normalize(dir);
  }

  private async getOriginalFormat() {
    return await this.mediaFormatRep.findOne({ where: { code: ReservedMediaFormat.ORIGINAL } });
  }

  private async getThumbFormat() {
    return await this.mediaFormatRep.findOne({ where: { code: ReservedMediaFormat.THUMB } });
  }

}
