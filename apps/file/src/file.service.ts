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
import { DeSerializedFile } from "@media/src/media.types";
import { LOGGER } from "@shared/modules/log/log.constants";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { FileEntity } from "@files/src/entity/file.entity";
import { CacheService } from "@shared/modules/cache/cache.types";
import { FileConfig } from "@files/gen-src/file.config";
import * as path from "path";
import { FilesUtils } from "@shared/utils/files.utils";
import * as fs from "fs";
import { MsException } from "@shared/exceptions/ms.exception";
import { NotFoundMsException } from "@shared/exceptions/not-found-ms.exception";
import { File } from "@files/src/file.types";
import { LocalizedString } from "@locale/src/locale.types";
import { LocalizedStringEntity } from "@locale/src/entity/localized-string.entity";
import { BadRequestMsException } from "@shared/exceptions/bad-request-ms.exception";
import PRIVATE_DIR = FileConfig.PRIVATE_DIR;
import PUBLIC_DIR = FileConfig.PUBLIC_DIR;
import createDirectoriesIfNotExist = FilesUtils.createDirectoriesIfNotExist;

/**
 * Injectable service for managing files, including uploading, finding, and removing files.
 */
@Injectable()
export class FileService {

  constructor(
    @Inject(LOGGER) protected readonly logger: Logger,
    @InjectRepository(FileEntity)
    private readonly fileRep: Repository<FileEntity>,
    private readonly cacheService: CacheService) {
  }

  /**
   * Uploads a file and saves it to the specified directory (public or private).
   * Also creates a FileEntity and saves the file's metadata in the database.
   * @param file - A deserialized file object containing file details and content.
   * @param isPublic - A boolean flag indicating if the file should be saved to the public directory (true) or private directory (false).
   * @param code - Specific identification code for file entity.
   * @param existedEntityId - ID of file entity for patch.
   * @param name - localized name for file entity.
   * @returns A promise that resolves to the created FileEntity.
   */
  async createOrUpdateFile(
    file: DeSerializedFile,
    isPublic = true,
    code?: string,
    existedEntityId?: number,
    name?: LocalizedString[]) {
    let entity: FileEntity = undefined;
    await this.fileRep.manager.transaction(async transactionManager => {
      if (existedEntityId) {
        entity = await this.findFileById(existedEntityId, isPublic);
        if (!entity) {
          throw new BadRequestMsException(`Cannot patch file with ID ${existedEntityId}, because than not exists`);
        }
        const dir = path.join(
          !entity.public ? await this.getPrivateDir() : await this.getPublicDir(),
          entity.id.toString()
        );
        await fs.promises.rm(dir, { recursive: true }).catch(err => {
          throw new MsException(HttpStatus.INTERNAL_SERVER_ERROR, `Failed to delete directory: ${dir}`, err);
        });
      } else {
        entity = await this.createFileEntity(isPublic);
      }
      const outputPath = await this.createFileDirectory(entity.public, entity.id.toString());
      let fileName = entity.id.toString();
      if (file.originalname.indexOf(".") !== -1) {
        fileName += `${path.extname(file.originalname)}`;
      }
      entity.size = file.size;
      entity.path = fileName;
      entity.name = name as LocalizedStringEntity[];
      entity.code = code;
      await fs.promises.writeFile(`${outputPath}/${fileName}`, file.buffer);
      await transactionManager.save(entity);
    });
    this.logger.log(`${!existedEntityId ? `Created` : `Updated`} file with ID ${entity.id}`);
    return entity;
  }

  /**
   * Finds a file entity by code.
   * @param code - The code of the file entity.
   * @returns The found file entity.
   */
  async findByCode(code: string) {
    return await this.createBasicFindQb()
      .where("file.code = :code", { code })
      .getOne();
  }

  /**
   * Finds a public file by its ID.
   * @param id - The ID of the file to find.
   * @returns A promise that resolves to the found FileEntity.
   */
  async findPublicById(id: number) {
    return this.findFileById(id, true);
  }

  /**
   * Finds a private file by its ID.
   * @param id - The ID of the file to find.
   * @returns A promise that resolves to the found FileEntity.
   */
  async findPrivateById(id: number) {
    return this.findFileById(id);
  }

  /**
   * Constructs the full file path for the given File object.
   * @param file - A File object containing the file's metadata.
   * @returns The full file path as a string.
   */
  async getFilePath(file: File) {
    const filePath = `${!file.public ? await this.getPrivateDir() : await this.getPublicDir()}/${file.id}/`;
    return filePath + file.path;
  }

  /**
   * Removes a file by its ID and deletes its corresponding directory.
   * @param id - The ID of the file to remove.
   * @returns A promise that resolves to the removed FileEntity.
   */
  async remove(id: number) {
    const file = await this.findFileById(id);
    const dir = path.join(
      !file.public ? await this.getPrivateDir() : await this.getPublicDir(),
      file.id.toString()
    );
    await this.fileRep.manager.transaction(async transactionManager => {
      await transactionManager.remove(file);
      await fs.promises.rm(dir, { recursive: true }).catch(err => {
        throw new MsException(HttpStatus.INTERNAL_SERVER_ERROR, `Failed to delete directory: ${dir}`, err);
      });
    });
    this.logger.log(`File with ID ${id} removed`);
    return file;
  }

  /**
   * Private helper method to find a file by its ID and public/private status.
   * @param id - The ID of the file to find.
   * @param isPublic - A boolean flag indicating if the file is public (true) or private (false).
   * @returns A promise that resolves to the found FileEntity.
   */
  private async findFileById(id: number, isPublic: boolean = undefined) {
    const qb = this.createBasicFindQb()
      .where("file.id = :id", { id });
    if (isPublic !== undefined) {
      qb.andWhere(`file.public = :isPublic`, { isPublic });
    }
    const entity = await qb.getOne();
    if (!entity) {
      throw new NotFoundMsException(`File with ID ${id} not found`);
    }
    return entity;
  }

  /**
   * Private helper method to create a query builder for finding files with their related entities.
   * @returns A query builder instance for finding files.
   */
  private createBasicFindQb() {
    return this.fileRep.createQueryBuilder("file")
      .leftJoinAndSelect("file.name", "name")
      .leftJoinAndSelect("name.lang", "lang")
      .leftJoinAndSelect("file.icon", "icon")
      .leftJoinAndSelect("icon.name", "iconName")
      .leftJoinAndSelect("iconName.lang", "iconLang")
      .leftJoinAndSelect("icon.files", "iconFiles")
      .leftJoinAndSelect("iconFiles.format", "iconFilesFormat")
      .leftJoinAndSelect("icon.type", "iconType")
      .leftJoinAndSelect("iconType.ext", "iconTypeExt")
      .leftJoinAndSelect("file.preview", "preview")
      .leftJoinAndSelect("preview.name", "previewName")
      .leftJoinAndSelect("previewName.lang", "previewLang")
      .leftJoinAndSelect("preview.files", "previewFiles")
      .leftJoinAndSelect("previewFiles.format", "previewFilesFormat")
      .leftJoinAndSelect("preview.type", "previewType")
      .leftJoinAndSelect("previewType.ext", "previewTypeExt");
  }

  /**
   * Private helper method to create a file directory for the specified public/private status and entity ID.
   * @param isPublic - A boolean flag indicating if the directory is for public files (true) or private files (false).
   * @param entityId - The entity ID to use as the directory name.
   * @returns A promise that resolves to the created directory path as a string.
   */
  private async createFileDirectory(isPublic: boolean, entityId: string): Promise<string> {
    const dir = path.join(!isPublic ? await this.getPrivateDir() : await this.getPublicDir(), entityId);
    await createDirectoriesIfNotExist(dir);
    return dir;
  }

  /**
   * Private helper method to create a new FileEntity with the specified public/private status.
   * @param isPublic - A boolean flag indicating if the FileEntity is for a public file (true) or private file (false).
   * @returns A promise that resolves to the created FileEntity.
   */
  private async createFileEntity(isPublic: boolean) {
    const entity = new FileEntity();
    entity.public = isPublic;
    return this.fileRep.save(entity);
  }

  private async getPublicDir() {
    return await this.cacheService.get(PUBLIC_DIR);
  }

  private async getPrivateDir() {
    return await this.cacheService.get(PRIVATE_DIR);
  }

}
