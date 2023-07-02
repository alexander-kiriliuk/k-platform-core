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

import { Body, Controller, Delete, Get, Inject, Param, Post, Query, UseGuards } from "@nestjs/common";
import { PageableData, PageableParams } from "@shared/modules/pageable/pageable.types";
import { AuthGuard } from "@shared/guards/auth.guard";
import { ConfigItem } from "@config/src/config.types";
import { MSG_BUS } from "@shared/modules/ms-client/ms-client.constants";
import { MessageBus } from "@shared/modules/ms-client/ms-client.types";


@Controller("config")
export class ConfigController {

  constructor(
    @Inject(MSG_BUS) private readonly bus: MessageBus) {
  }

  @UseGuards(AuthGuard)
  @Get("/")
  async list(@Query() params: PageableParams) {
    return await this.bus.dispatch<PageableData<ConfigItem>, PageableParams>("config.properties.get", params);
  }

  @UseGuards(AuthGuard)
  @Post("/")
  async setProperty(@Body() body: ConfigItem) {
    return await this.bus.dispatch<boolean, ConfigItem>("config.properties.set", body);
  }

  @UseGuards(AuthGuard)
  @Delete("/:key")
  async removeProperty(@Param("key") key: string) {
    return await this.bus.dispatch<boolean, string>("config.properties.remove", key);
  }

}
