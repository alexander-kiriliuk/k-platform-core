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

import { Body, Controller, Delete, Get, Inject, Patch, Post, Query } from "@nestjs/common";
import { MSG_BUS } from "@shared/modules/ms-client/ms-client.constants";
import { MessageBus } from "@shared/modules/ms-client/ms-client.types";
import { LocalizedMedia, LocalizedString } from "@locale/src/locale.types";

@Controller("/locale")
export class LocaleController {

  constructor(
    @Inject(MSG_BUS) private readonly bus: MessageBus) {
  }

  @Get("/string")
  async getStringLocaleList(@Query() payload: { id: string[] }) {
    return await this.bus.dispatch<LocalizedString[]>("locale.string.list.get", payload.id);
  }

  @Post("/string")
  async createStringLocaleList(@Body() body: LocalizedString[]) {
    return await this.bus.dispatch<LocalizedString[]>("locale.string.list.create", body);
  }

  @Patch("/string")
  async updateStringLocaleList(@Body() body: LocalizedString[]) {
    return await this.bus.dispatch<LocalizedString[]>("locale.string.list.update", body);
  }

  @Delete("/string")
  async deleteStringLocaleList(@Query() payload: { id: string[] }) {
    return await this.bus.dispatch<LocalizedString[]>("locale.string.list.delete", payload.id);
  }

  @Get("/media")
  async getMediaLocaleList(@Query() payload: { id: string[] }) {
    return await this.bus.dispatch<LocalizedMedia[]>("locale.media.list.get", payload.id);
  }

  @Post("/media")
  async createMediaLocaleList(@Body() body: LocalizedMedia[]) {
    return await this.bus.dispatch<LocalizedMedia[]>("locale.media.list.create", body);
  }

  @Patch("/media")
  async updateMediaLocaleList(@Body() body: LocalizedMedia[]) {
    return await this.bus.dispatch<LocalizedMedia[]>("locale.media.list.update", body);
  }

  @Delete("/media")
  async deleteMediaLocaleList(@Query() payload: { id: string[] }) {
    return await this.bus.dispatch<LocalizedMedia[]>("locale.media.list.delete", payload.id);
  }

}
