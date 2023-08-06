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
  UseInterceptors
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { AuthGuard } from "@shared/guards/auth.guard";
import { NotEmptyPipe } from "@shared/pipes/not-empty.pipe";
import { DEFAULT_MEDIA_TYPE } from "@media/media.constants";
import { Response } from "express";
import * as path from "path";
import { MediaService } from "@media/media.service";

@Controller("/media")
export class MediaController {

  constructor(
    private readonly mediaService: MediaService) {
  }

  @Post("/upload/:type?")
  @UseInterceptors(FileInterceptor("file"))
  async createMedia(@UploadedFile("file", new NotEmptyPipe("file")) file: Express.Multer.File,
                    @Param("type") type = DEFAULT_MEDIA_TYPE) {
    return await this.mediaService.createOrUpdateMedia(file.buffer, type);
  }

  @UseGuards(AuthGuard)
  @Get("/private/:id")
  async getPrivateMedia(
    @Res() res: Response,
    @Param("id") id: number,
    @Query("format") format: string,
    @Query("webp") webp: boolean) {
    const media = await this.mediaService.findPrivateById(id);
    const mediaPath = await this.mediaService.getMediaPath(media, format, webp);
    res.sendFile(path.join(process.cwd(), mediaPath));
  }

  @UseGuards(AuthGuard)
  @Get("/:id")
  async getMedia(@Param("id") id: number) {
    return await this.mediaService.findPublicById(id);
  }

  @UseGuards(AuthGuard)
  @Delete("/:id")
  async removeMedia(@Param("id") id: number) {
    return await this.mediaService.remove(id);
  }

}
