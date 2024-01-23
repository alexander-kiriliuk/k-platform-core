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

import { Body, Controller, Get, Param, Post, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { AuthGuard } from "@shared/guards/auth.guard";
import { XdbObject } from "@xml-data-bridge/xml-data-bridge.types";
import { XdbService } from "@xml-data-bridge/xml-data-bridge.constants";
import { ForRoles } from "@shared/decorators/for-roles.decorator";
import { Roles } from "@shared/constants";
import { FileInterceptor } from "@nestjs/platform-express";
import { NotEmptyPipe } from "@shared/pipes/not-empty.pipe";

@Controller("xdb")
@UseGuards(AuthGuard)
export class XmlDataBridgeController {

  constructor(
    private readonly xdbService: XdbService) {
  }

  @Post("/import")
  @ForRoles(Roles.ROOT)
  async import(@Body() body: XdbObject) {
    return await this.xdbService.importXml(body);
  }

  @Post("/import-file")
  @UseInterceptors(FileInterceptor("file"))
  @ForRoles(Roles.ROOT)
  async importFile(@UploadedFile("file", new NotEmptyPipe("file")) file: Express.Multer.File) {
    return await this.xdbService.importFromFile(file.buffer);
  }

  @Get("/export/:target/:id")
  @ForRoles(Roles.ADMIN)
  async export(@Param("target") target: string, @Param("id") id: string) {
    return await this.xdbService.exportXml(target, id);
  }

}
