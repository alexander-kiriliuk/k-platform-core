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

import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { DeSerializedFile, MediaFormat } from "@media/src/media.types";
import { MediaFileEntity } from "@media/src/entity/media-file.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { MediaTypeEntity } from "@media/src/entity/media-type.entity";
import { MediaEntity } from "@media/src/entity/media.entity";
import { MediaConfig } from "@media/gen-src/media.config";
import { MEDIA_TYPE_RELATIONS, ReservedMediaFormat } from "@media/src/media.constants";
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
import PRIVATE_DIR = MediaConfig.PRIVATE_DIR;
import PUBLIC_DIR = MediaConfig.PUBLIC_DIR;
import createDirectoriesIfNotExist = FileUtils.createDirectoriesIfNotExist;
import generateRandomInt = NumberUtils.generateRandomInt;

@Injectable()
export class MediaService implements OnModuleInit {

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
  }

  async onModuleInit() {
    this.originalFormat = await this.mediaFormatRep.findOne({ where: { code: ReservedMediaFormat.ORIGINAL } });
    this.thumbFormat = await this.mediaFormatRep.findOne({ where: { code: ReservedMediaFormat.THUMB } });
  }

  async findById(id: string) {
    // TODO
    return Promise.resolve(1);
  }

  async remove(id: string) {
    // TODO
    return Promise.resolve(1);
  }

  async upload(file: DeSerializedFile, type: string): Promise<MediaEntity> {
    const mediaType = await this.getMediaType(type);
    const savedMediaEntity = await this.createMediaEntity(mediaType);
    const mediaDirectory = await this.createMediaDirectory(mediaType, savedMediaEntity.id.toString());
    const originalNameWithoutExt = path.basename(file.originalname, path.extname(file.originalname));
    const outputPath = path.join(mediaDirectory, generateRandomInt().toString());
    const formatsToProcess = this.getFormatsToProcess(mediaType);
    savedMediaEntity.files = await this.processFormats(
      file, formatsToProcess, mediaType, savedMediaEntity, outputPath, originalNameWithoutExt,
    );
    await this.mediaRep.save(savedMediaEntity);
    return savedMediaEntity;
  }

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

  private async createMediaEntity(mediaType: MediaTypeEntity): Promise<MediaEntity> {
    const mediaEntity = new MediaEntity();
    mediaEntity.type = mediaType;
    mediaEntity.name = []; // Установите значения LocalizedStringEntity в соответствии с вашими требованиями
    return this.mediaRep.save(mediaEntity);
  }

  private async createMediaDirectory(mediaType: MediaTypeEntity, mediaEntityId: string): Promise<string> {
    const mediaDirectory = path.join(mediaType.private ? PRIVATE_DIR : PUBLIC_DIR, mediaEntityId);
    await createDirectoriesIfNotExist(mediaDirectory);
    return mediaDirectory;
  }

  private getFormatsToProcess(mediaType: MediaTypeEntity): MediaFormatEntity[] {
    mediaType.formats = mediaType.formats.filter(
      f => f.code !== ReservedMediaFormat.ORIGINAL && f.code !== ReservedMediaFormat.THUMB,
    );
    return [this.thumbFormat, this.originalFormat, ...mediaType.formats];
  }

  private async processFormats(
    file: DeSerializedFile,
    formats: MediaFormatEntity[],
    mediaType: MediaTypeEntity,
    mediaEntity: MediaEntity,
    outputPath: string,
    originalNameWithoutExt: string,
  ): Promise<MediaFileEntity[]> {
    const savedMediaFiles: MediaFileEntity[] = [];
    for (const format of formats) {
      let imgBuffer = await this.resizeImage(file.buffer, format);
      if (format.code !== ReservedMediaFormat.ORIGINAL) {
        imgBuffer = await this.optimizeImage(imgBuffer, mediaType.ext.code);
      }
      const resizedImagePath = `${outputPath}_${format.code}.${mediaType.ext.code}`;
      await fs.promises.writeFile(resizedImagePath, imgBuffer);
      const resizedMediaFile = await this.createMediaFileEntity(imgBuffer, originalNameWithoutExt, format, mediaEntity);
      savedMediaFiles.push(await this.mediaFileRep.save(resizedMediaFile));
      if (mediaType.vp6) {
        const webpImage = await sharp(imgBuffer).webp({ quality: 78 }).toBuffer();
        const webpImagePath = `${outputPath}_${format.code}.webp`;
        await fs.promises.writeFile(webpImagePath, webpImage);
        const webpMediaFile = await this.createMediaFileEntity(webpImage, originalNameWithoutExt, format, mediaEntity);
        savedMediaFiles.push(await this.mediaFileRep.save(webpMediaFile));
      }
    }
    return savedMediaFiles;
  }

  private async optimizeImage(buffer: Buffer, fileExt: string) {
    try {
      switch (fileExt) {
        case "png":
          return await imagemin.buffer(buffer, {
            plugins: [imageminPngquant({ quality: [0.6, 0.8] })], // todo add quality from config
          });
        case "jpg":
        case "jpeg":
          return await imagemin.buffer(buffer, {
            plugins: [imageminMozjpeg({ quality: 78 })],
          });
      }
    } catch (e) {
      this.logger.error(`Image-optimize error`, e);
      return buffer;
    }
  }

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

  private async createMediaFileEntity(
    image: Buffer,
    originalNameWithoutExt: string,
    format: MediaFormatEntity,
    mediaEntity: MediaEntity,
  ): Promise<MediaFileEntity> {
    const metadata = await sharp(image).metadata();
    const mediaFile = new MediaFileEntity();
    mediaFile.code = `${generateRandomInt()}_${format.code}`;
    mediaFile.name = originalNameWithoutExt;
    mediaFile.format = format;
    mediaFile.media = mediaEntity;
    mediaFile.width = metadata.width;
    mediaFile.height = metadata.height;
    mediaFile.size = image.length;
    return mediaFile;
  }

}
