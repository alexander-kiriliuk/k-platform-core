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

import { HttpStatus, Inject, Injectable, Logger } from "@nestjs/common";
import { DeSerializedFile, MediaFormat } from "@media/src/media.types";
import { MediaFileEntity } from "@media/src/entity/media-file.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { MediaTypeEntity } from "@media/src/entity/media-type.entity";
import { MediaEntity } from "@media/src/entity/media.entity";
import { MediaConfig } from "@media/gen-src/media.config";
import { DEFAULT_MEDIA_QUALITY, MEDIA_TYPE_RELATIONS, ReservedMediaFormat } from "@media/src/media.constants";
import { MediaFormatEntity } from "@media/src/entity/media-format.entity";
import { BadRequestMsException } from "@shared/exceptions/bad-request-ms.exception";
import { FileUtils } from "@shared/utils/file.utils";
import { NumberUtils } from "@shared/utils/number.utils";
import * as sharp from "sharp";
import * as imagemin from "imagemin";
import * as fs from "fs";
import * as path from "path";
import imageminPngquant from "imagemin-pngquant";
import * as imageminMozjpeg from "imagemin-mozjpeg";
import { LOGGER } from "@shared/modules/log/log.constants";
import { NotFoundMsException } from "@shared/exceptions/not-found-ms.exception";
import { MsException } from "@shared/exceptions/ms.exception";
import PRIVATE_DIR = MediaConfig.PRIVATE_DIR;
import PUBLIC_DIR = MediaConfig.PUBLIC_DIR;
import createDirectoriesIfNotExist = FileUtils.createDirectoriesIfNotExist;
import generateRandomInt = NumberUtils.generateRandomInt;
import THUMB = ReservedMediaFormat.THUMB;
import ORIGINAL = ReservedMediaFormat.ORIGINAL;

/**
 * `MediaService` is a service responsible for managing media files, including
 * uploading, resizing, optimizing, and removing images.
 */
@Injectable()
export class MediaService {

  private originalFormat: MediaFormat;
  private thumbFormat: MediaFormat;

  constructor(
    @Inject(LOGGER) protected readonly logger: Logger,
    @InjectRepository(MediaEntity)
    private readonly mediaRep: Repository<MediaEntity>,
    @InjectRepository(MediaTypeEntity)
    private readonly mediaTypeRep: Repository<MediaTypeEntity>,
    @InjectRepository(MediaFormatEntity)
    private readonly mediaFormatRep: Repository<MediaFormatEntity>,
    @InjectRepository(MediaFileEntity)
    private readonly mediaFileRep: Repository<MediaFileEntity>) {
    this.logger.log("Initializing MediaService");
    this.mediaFormatRep.findOne({ where: { code: ORIGINAL } }).then(v => {
      this.originalFormat = v;
    });
    this.mediaFormatRep.findOne({ where: { code: THUMB } }).then(v => {
      this.thumbFormat = v;
    });
  }


  /**
   * Finds a media entity by ID with public access.
   * @param id - The ID of the media entity.
   * @returns The found media entity.
   * @throws NotFoundMsException if the media entity is not found.
   */
  async findPublicById(id: number): Promise<MediaEntity> {
    return this.findMediaById(id);
  }

  /**
   * Finds a media entity by ID with private access.
   * @param id - The ID of the media entity.
   * @returns The found private media entity.
   * @throws NotFoundMsException if the private media entity is not found.
   */
  async findPrivateById(id: number): Promise<MediaEntity> {
    return this.findMediaById(id, true);
  }

  /**
   * Removes a media entity by ID and cleans up related files.
   * @param id - The ID of the media entity.
   * @returns The removed media entity.
   */
  async remove(id: number) {
    const media = await this.findPublicById(id);
    const dir = path.join(
      media.type.private ? PRIVATE_DIR : PUBLIC_DIR,
      media.id.toString(),
    );
    await this.mediaRep.manager.transaction(async transactionManager => {
      await transactionManager.remove(media.files);
      await transactionManager.remove(media);
      await fs.promises.rm(dir, { recursive: true }).catch(err => {
        throw new MsException(HttpStatus.INTERNAL_SERVER_ERROR, `Failed to delete directory: ${dir}`, err);
      });
    });
    this.logger.log(`Media with ID ${id} removed`);
    return media;
  }

  /**
   * Uploads and processes a media file.
   * @param file - The deserialized media file.
   * @param type - The media type.
   * @returns The uploaded and processed media entity.
   */
  async upload(file: DeSerializedFile, type: string): Promise<MediaEntity> {
    const mediaType = await this.getMediaType(type);
    const savedMediaEntity = await this.createMediaEntity(mediaType);
    const outputPath = await this.createMediaDirectory(mediaType, savedMediaEntity.id.toString());
    const formatsToProcess = this.getFormatsToProcess(mediaType);
    await this.mediaRep.manager.transaction(async transactionManager => {
      savedMediaEntity.files = await this.processFormats(
        file, formatsToProcess, mediaType, savedMediaEntity, outputPath,
      );
      await transactionManager.save(savedMediaEntity);
    });
    this.logger.log(`Uploaded media with ID ${savedMediaEntity.id}`);
    return savedMediaEntity;
  }

  /**
   * Retrieves the media type based on the given type code.
   * @param type - The media type code.
   * @returns The MediaTypeEntity instance.
   * @throws BadRequestMsException if the media type is not found.
   */
  private async getMediaType(type: string): Promise<MediaTypeEntity> {
    const mediaType = await this.mediaTypeRep.findOne({
      where: { code: type },
      relations: MEDIA_TYPE_RELATIONS,
    });
    if (!mediaType) {
      throw new BadRequestMsException("Media type not found");
    }
    return mediaType;
  }

  /**
   * Creates a new media entity with the provided media type.
   * @param mediaType - The MediaTypeEntity instance.
   * @returns The created MediaEntity instance.
   */
  private async createMediaEntity(mediaType: MediaTypeEntity): Promise<MediaEntity> {
    const mediaEntity = new MediaEntity();
    mediaEntity.type = mediaType;
    mediaEntity.name = [];
    return this.mediaRep.save(mediaEntity);
  }

  /**
   * Creates a media directory for the given media type and media entity ID.
   * @param mediaType - The MediaTypeEntity instance.
   * @param mediaEntityId - The media entity ID.
   * @returns The path to the created media directory.
   */
  private async createMediaDirectory(mediaType: MediaTypeEntity, mediaEntityId: string): Promise<string> {
    const mediaDirectory = path.join(mediaType.private ? PRIVATE_DIR : PUBLIC_DIR, mediaEntityId);
    await createDirectoriesIfNotExist(mediaDirectory);
    return mediaDirectory;
  }

  /**
   * Retrieves the media formats that need to be processed for the given media type.
   * @param mediaType - The MediaTypeEntity instance.
   * @returns An array of MediaFormatEntity instances to be processed.
   */
  private getFormatsToProcess(mediaType: MediaTypeEntity): MediaFormatEntity[] {
    mediaType.formats = mediaType.formats.filter(
      f => f.code !== ORIGINAL && f.code !== THUMB,
    );
    return [this.thumbFormat, this.originalFormat, ...mediaType.formats];
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
    file: DeSerializedFile,
    formats: MediaFormatEntity[],
    mediaType: MediaTypeEntity,
    mediaEntity: MediaEntity,
    outputPath: string,
  ): Promise<MediaFileEntity[]> {
    const processingPromises = formats.map(async (format) => {
      const quality = mediaType.quality || DEFAULT_MEDIA_QUALITY;
      let imgBuffer = file.buffer;
      if (format.code !== ORIGINAL) {
        imgBuffer = await this.resizeImage(file.buffer, format);
        imgBuffer = await this.optimizeImage(imgBuffer, mediaType.ext.code, quality);
      }
      const fileName = generateRandomInt();
      const fileNameWithSuffix = `${fileName}_${format.code}`;
      const resizedImagePath = `${outputPath}/${fileNameWithSuffix}.${mediaType.ext.code}`;
      await fs.promises.writeFile(resizedImagePath, imgBuffer);
      const resizedMediaFile = await this.createMediaFileEntity(imgBuffer, format, mediaEntity, fileNameWithSuffix);
      if (mediaType.vp6) {
        const webpImage = await sharp(imgBuffer).webp({ quality }).toBuffer();
        const webpImagePath = `${outputPath}/${fileNameWithSuffix}.webp`;
        await fs.promises.writeFile(webpImagePath, webpImage);
        const webpMediaFile = await this.createMediaFileEntity(webpImage, format, mediaEntity, fileNameWithSuffix);
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
            plugins: [imageminPngquant({ quality: this.getPngQualityRange(quality) })],
          });
        case "jpg":
        case "jpeg":
          return await imagemin.buffer(buffer, {
            plugins: [imageminMozjpeg({ quality })],
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
    fileName: string,
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
   * @throws NotFoundMsException if the media entity is not found.
   */
  private async findMediaById(id: number, privateMedia = false): Promise<MediaEntity> {
    const mediaEntity = await this.createBasicFindQb()
      .where("media.id = :id", { id })
      .andWhere(`type.private = ${privateMedia}`)
      .getOne();
    if (!mediaEntity) {
      throw new NotFoundMsException(`Media with ID ${id} not found`);
    }
    return mediaEntity;
  }

  /**
   * Creates a basic query builder for finding media entities.
   * @returns The created query builder.
   */
  private createBasicFindQb() {
    return this.mediaRep.createQueryBuilder("media")
      .innerJoinAndSelect("media.type", "type")
      .innerJoinAndSelect("type.formats", "formats")
      .innerJoinAndSelect("type.ext", "ext")
      .innerJoinAndSelect("media.files", "files")
      .innerJoinAndSelect("files.format", "format")
      .leftJoinAndSelect("media.name", "name")
      .leftJoinAndSelect("name.lang", "lang");
  }

}
