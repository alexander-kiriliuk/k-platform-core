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
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  AuthGuard,
  ConfigItem,
  ConfigService,
  ForRoles,
  PageableData,
  PageableParams,
  Roles,
} from "@k-platform/core";

@Controller("config")
@UseGuards(AuthGuard)
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @UseGuards(AuthGuard)
  @Get("/")
  @ForRoles(Roles.ADMIN)
  async list(
    @Query() params: PageableParams,
  ): Promise<PageableData<ConfigItem>> {
    return await this.configService.getPropertiesPage(params);
  }

  @UseGuards(AuthGuard)
  @Post("/")
  @ForRoles(Roles.ADMIN)
  async setProperty(@Body() body: ConfigItem): Promise<boolean> {
    return await this.configService.setProperty(body);
  }

  @UseGuards(AuthGuard)
  @Delete("/")
  @ForRoles(Roles.ADMIN)
  async removeProperty(@Query("key") key: string): Promise<boolean> {
    return await this.configService.removeProperty(key);
  }
}
