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

import { Controller } from "@nestjs/common";
import { LocaleService } from "./locale.service";
import { MessagePattern } from "@nestjs/microservices";
import { LocalizedMedia, LocalizedString } from "@locale/src/locale.types";

@Controller()
export class LocaleController {

  constructor(
    private readonly localeService: LocaleService) {
  }

  @MessagePattern("locale.string.list.get")
  async getStringLocaleList(ids: string[]) {
    return await this.localeService.getStringLocaleList(ids);
  }

  @MessagePattern("locale.string.list.create")
  async createStringLocaleList(payload: LocalizedString[]) {
    // todo
    console.log(payload);
  }

  @MessagePattern("locale.string.list.update")
  async updateStringLocaleList(payload: LocalizedString[]) {
    // todo
    console.log(payload);
  }

  @MessagePattern("locale.string.list.delete")
  async deleteStringLocaleList(ids: string[]) {
    // todo
    console.log(ids);
  }

  @MessagePattern("locale.media.list.get")
  async getMediaLocaleList(ids: string[]) {
    // todo
    console.log(ids);
  }

  @MessagePattern("locale.media.list.create")
  async createMediaLocaleList(payload: LocalizedMedia[]) {
    // todo
    console.log(payload);
  }

  @MessagePattern("locale.media.list.update")
  async updateMediaLocaleList(payload: LocalizedMedia[]) {
    // todo
    console.log(payload);
  }

  @MessagePattern("locale.media.list.delete")
  async deleteMediaLocaleList(ids: string[]) {
    // todo
    console.log(ids);
  }

}
