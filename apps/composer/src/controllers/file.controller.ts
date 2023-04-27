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
import { MsClient } from "@shared/modules/ms-client/ms-client";
import { FileInterceptor } from "@nestjs/platform-express";
import { File as MulterFile } from "multer";
import { AuthGuard } from "@shared/guards/auth.guard";
import { FilesUtils } from "@shared/utils/files.utils";
import { NotEmptyPipe } from "@shared/pipes/not-empty.pipe";
import { Response } from "express";
import * as path from "path";
import { File, UploadFileRequest } from "@files/src/file.types";
import { FileService } from "@files/src/file.service";
import serializeFile = FilesUtils.serializeFile;

@Controller("/file")
export class FileController {

  constructor(
    private readonly fileService: FileService,
    private readonly msClient: MsClient) {
  }

  @Post("/upload")
  @UseInterceptors(FileInterceptor("file"))
  async createFile(
    @UploadedFile("file", new NotEmptyPipe("file")) file: MulterFile,
    @Query("public") isPublic = "true") {
    const serializedFile = serializeFile(file);
    return await this.msClient.dispatch<File, UploadFileRequest>("file.upload", {
      file: serializedFile,
      public: isPublic === "true"
    }, { timeout: 30000 });
  }

  @UseGuards(AuthGuard)
  @Get("/private/:id")
  async getPrivateFile(@Res() res: Response, @Param("id") id: string) {
    const file = await this.msClient.dispatch<File, string>("file.get.private.by.id", id);
    const filePath = this.fileService.getFilePath(file);
    res.sendFile(path.join(process.cwd(), filePath));
  }

  @UseGuards(AuthGuard)
  @Get("/:id")
  async getFile(@Param("id") id: string) {
    return await this.msClient.dispatch<File, string>("file.get.by.id", id);
  }

  @UseGuards(AuthGuard)
  @Delete("/:id")
  async removeFile(@Param("id") id: string) {
    return await this.msClient.dispatch<File, string>("file.remove", id);
  }

}
