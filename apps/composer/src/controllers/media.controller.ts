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

import { Controller, Delete, Get, Param, Post, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { MsClient } from "@shared/modules/ms-client/ms-client";
import { FileInterceptor } from "@nestjs/platform-express";
import { File } from "multer";
import { DEFAULT_MEDIA_TYPE, Media, UploadMediaRequest } from "@media/src/media.types";
import { AuthGuard } from "@shared/guards/auth.guard";
import { FileUtils } from "@shared/utils/file.utils";
import serializeFile = FileUtils.serializeFile;

@Controller("/media")
export class MediaController {

  constructor(
    private readonly msClient: MsClient) {
  }

  @Post("/upload/:type?")
  @UseInterceptors(FileInterceptor("file"))
  async createMedia(@UploadedFile() file: File, @Param("type") type: string = DEFAULT_MEDIA_TYPE) {
    const serializedFile = serializeFile(file);
    return await this.msClient.dispatch<Media, UploadMediaRequest>("media.upload", {
      type: type,
      files: [serializedFile],
    });
  }

  @UseGuards(AuthGuard)
  @Get("/:id")
  async getMedia(@Param("id") id: string) {
    return await this.msClient.dispatch<Media, string>("media.get.by.id", id);
  }

  @UseGuards(AuthGuard)
  @Delete("/:id")
  async removeMedia(@Param("id") id: string) {
    return await this.msClient.dispatch<void, string>("media.remove", id);
  }

}
