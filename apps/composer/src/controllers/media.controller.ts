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
  Inject,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { File } from "multer";
import { Media, UpsertMediaRequest } from "@media/src/media.types";
import { AuthGuard } from "@shared/guards/auth.guard";
import { FilesUtils } from "@shared/utils/files.utils";
import { NotEmptyPipe } from "@shared/pipes/not-empty.pipe";
import { DEFAULT_MEDIA_TYPE } from "@media/src/media.constants";
import { Response } from "express";
import * as path from "path";
import { MediaService } from "@media/src/media.service";
import { MSG_BUS } from "@shared/modules/ms-client/ms-client.constants";
import { MessageBus } from "@shared/modules/ms-client/ms-client.types";
import serializeFile = FilesUtils.serializeFile;

@Controller("/media")
export class MediaController {

  constructor(
    @Inject(MSG_BUS) private readonly bus: MessageBus,
    private readonly mediaService: MediaService) {
  }

  @Post("/upload/:type?")
  @UseInterceptors(FileInterceptor("file"))
  async createMedia(@UploadedFile("file", new NotEmptyPipe("file")) file: File,
                    @Param("type") type = DEFAULT_MEDIA_TYPE) {
    const serializedFile = serializeFile(file);
    return await this.bus.dispatch<Media, UpsertMediaRequest>("media.upsert", {
      type: type,
      file: serializedFile
    }, { timeout: 30000 });
  }

  @UseGuards(AuthGuard)
  @Get("/private/:id")
  async getPrivateMedia(
    @Res() res: Response,
    @Param("id") id: string,
    @Query("format") format: string,
    @Query("webp") webp: boolean) {
    const media = await this.bus.dispatch<Media, string>("media.get.private.by.id", id);
    const mediaPath = this.mediaService.getMediaPath(media, format, webp);
    res.sendFile(path.join(process.cwd(), mediaPath));
  }

  @UseGuards(AuthGuard)
  @Get("/:id")
  async getMedia(@Param("id") id: string) {
    return await this.bus.dispatch<Media, string>("media.get.by.id", id);
  }

  @UseGuards(AuthGuard)
  @Delete("/:id")
  async removeMedia(@Param("id") id: string) {
    return await this.bus.dispatch<Media, string>("media.remove", id);
  }

}
