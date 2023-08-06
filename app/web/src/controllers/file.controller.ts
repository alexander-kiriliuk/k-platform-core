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
import { Response } from "express";
import * as path from "path";
import { FileService } from "@files/file.service";


@Controller("/file")
export class FileController {

  constructor(
    private readonly fileService: FileService) {
  }

  @Post("/upload")
  @UseInterceptors(FileInterceptor("file"))
  async createFile(
    @UploadedFile("file", new NotEmptyPipe("file")) file: Express.Multer.File,
    @Query("public") isPublic = "true") {
    return this.fileService.createOrUpdateFile(file.buffer, file.originalname.split(".").pop(), isPublic === "true");
  }

  @UseGuards(AuthGuard)
  @Get("/private/:id")
  async getPrivateFile(@Res() res: Response, @Param("id") id: number) {
    const file = await this.fileService.findPrivateById(id);
    const filePath = await this.fileService.getFilePath(file);
    res.sendFile(path.join(process.cwd(), filePath));
  }

  @UseGuards(AuthGuard)
  @Get("/:id")
  async getFile(@Param("id") id: number) {
    return await this.fileService.findPublicById(id);
  }

  @UseGuards(AuthGuard)
  @Delete("/:id")
  async removeFile(@Param("id") id: number) {
    return await this.fileService.remove(id);
  }

}