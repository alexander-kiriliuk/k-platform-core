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

import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { PageableData, PageableParams } from "@shared/modules/pageable/pageable.types";
import { MsClient } from "@shared/modules/ms-client/ms-client";
import { AuthGuard } from "@shared/guards/auth.guard";
import { ConfigItem } from "@config/src/config.types";


@Controller("config")
export class ConfigController {

  constructor(
    private readonly msClient: MsClient) {
  }

  @UseGuards(AuthGuard)
  @Get("/")
  async list(@Query() params: PageableParams) {
    return await this.msClient.dispatch<PageableData<ConfigItem>, PageableParams>("config.properties.get", params);
  }

  @UseGuards(AuthGuard)
  @Post("/")
  async setProperty(@Body() body: ConfigItem) {
    return await this.msClient.dispatch<boolean, ConfigItem>("config.properties.set", body);
  }

  @UseGuards(AuthGuard)
  @Delete("/:key")
  async removeProperty(@Param("key") key: string) {
    return await this.msClient.dispatch<boolean, string>("config.properties.remove", key);
  }

}
