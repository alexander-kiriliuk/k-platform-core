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

import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@shared/guards/auth.guard";
import { XdbObject } from "@xml-data-bridge/xml-data-bridge.types";
import { XmlDataBridgeService } from "@xml-data-bridge/xml-data-bridge.service";

@Controller("xdb")
export class XmlDataBridgeController {

  constructor(
    private readonly xdbService: XmlDataBridgeService) {
  }

  @UseGuards(AuthGuard)
  @Post("/import")
  async import(@Body() body: XdbObject) {
    return await this.xdbService.importXml(body);
  }

  @UseGuards(AuthGuard)
  @Get("/export/:target/:id")
  async export(@Param("target") target: string, @Param("id") id: string) {
    return await this.xdbService.exportXml(target, id);
  }

}
