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

import { Body, Controller, Get, Inject, Param, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@shared/guards/auth.guard";
import { XdbObject, XdbRequest } from "@xml-data-bridge/src/xml-data-bridge.types";
import { MSG_BUS } from "@shared/modules/ms-client/ms-client.constants";
import { MessageBus } from "@shared/modules/ms-client/ms-client.types";

@Controller("xdb")
export class XmlDataBridgeController {

  constructor(
    @Inject(MSG_BUS) private readonly bus: MessageBus) {
  }

  @UseGuards(AuthGuard)
  @Post("/import")
  async import(@Body() body: XdbObject) {
    return await this.bus.dispatch<boolean, XdbObject>("xdb.import", body);
  }

  @UseGuards(AuthGuard)
  @Get("/export/:target/:id")
  async export(@Param("target") target: string, @Param("id") id: string) {
    return await this.bus.dispatch<boolean, XdbRequest>("xdb.export", {
      target, id
    });
  }

}
