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

import { Controller } from "@nestjs/common";
import { FileService } from "./file.service";
import { MessagePattern } from "@nestjs/microservices";
import { FilesUtils } from "@shared/utils/files.utils";
import { UpsertFileRequest } from "@files/src/file.types";
import deSerializeFile = FilesUtils.deSerializeFile;

@Controller()
export class FileController {

  constructor(
    private readonly filesService: FileService) {
  }

  @MessagePattern("file.upsert")
  async upsertFile(payload: UpsertFileRequest) {
    const deserializedFile = deSerializeFile(payload.file);
    return await this.filesService.createOrUpdateFile(
      deserializedFile,
      payload.public,
      payload.code,
      payload.entityIdForPatch,
      payload.entityName
    );
  }

  @MessagePattern("file.get.any.by.code")
  async findMediaByCode(code: string) {
    return await this.filesService.findByCode(code);
  }

  @MessagePattern("file.get.by.id")
  async findMediaById(id: number) {
    return await this.filesService.findPublicById(id);
  }

  @MessagePattern("file.get.private.by.id")
  async findPrivateMediaById(id: number) {
    return await this.filesService.findPrivateById(id);
  }

  @MessagePattern("file.remove")
  async removeMedia(id: number) {
    return await this.filesService.remove(id);
  }

}
