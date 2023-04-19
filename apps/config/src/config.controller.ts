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
import { MessagePattern } from "@nestjs/microservices";
import { ConfigService } from "./config.service";
import { PageableParams } from "@shared/modules/pageable/pageable.types";
import { ConfigItem } from "./config.types";


@Controller()
export class ConfigController {

  constructor(
    private readonly configService: ConfigService) {
  }

  @MessagePattern("config.properties.get")
  async propsList(payload: PageableParams) {
    return await this.configService.getPropertiesPage(payload);
  }

  @MessagePattern("config.properties.set")
  async setProperty(payload: ConfigItem) {
    return await this.configService.setProperty(payload);
  }

  @MessagePattern("config.properties.remove")
  async removeProperty(payload: string) {
    return await this.configService.removeProperty(payload);
  }

}
