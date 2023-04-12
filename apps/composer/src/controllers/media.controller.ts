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
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { MsClient } from "@shared/modules/ms-client/ms-client";
import { FileInterceptor } from "@nestjs/platform-express";
import { File } from "multer";
import { Media, UploadMediaRequest } from "@media/src/media.types";
import { AuthGuard } from "@shared/guards/auth.guard";
import { FileUtils } from "@shared/utils/file.utils";
import { NotEmptyPipe } from "@shared/pipes/not-empty.pipe";
import { DEFAULT_MEDIA_TYPE } from "@media/src/media.constants";
import { Response } from "express";
import { MediaUtils } from "@media/src/media.utils";
import * as path from "path";
import serializeFile = FileUtils.serializeFile;
import getMediaPath = MediaUtils.getMediaPath;

@Controller("/media")
export class MediaController {

  constructor(
    private readonly msClient: MsClient) {
  }

  @Post("/upload/:type?")
  @UseInterceptors(FileInterceptor("file"))
  async createMedia(@UploadedFile("file", new NotEmptyPipe("file")) file: File,
                    @Param("type") type = DEFAULT_MEDIA_TYPE) {
    const serializedFile = serializeFile(file);
    return await this.msClient.dispatch<Media, UploadMediaRequest>("media.upload", {
      type: type,
      file: serializedFile,
    }, { timeout: 30000 });
  }

  @UseGuards(AuthGuard)
  @Get("/private/:id")
  async getPrivateMedia(
    @Res() res: Response,
    @Param("id") id: string,
    @Query("format") format: string,
    @Query("webp") webp: boolean) {
    const media = await this.msClient.dispatch<Media, string>("media.get.private.by.id", id);
    let mediaPath = getMediaPath(media, format, webp);
    res.sendFile(path.join(process.cwd(), mediaPath));
  }

  @UseGuards(AuthGuard)
  @Get("/:id")
  async getMedia(@Param("id") id: string) {
    return await this.msClient.dispatch<Media, string>("media.get.by.id", id);
  }

  @UseGuards(AuthGuard)
  @Delete("/:id")
  async removeMedia(@Param("id") id: string) {
    return await this.msClient.dispatch<Media, string>("media.remove", id);
  }

}