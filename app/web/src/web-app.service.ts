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

import { Inject, Injectable, Logger } from "@nestjs/common";
import { LOGGER } from "@shared/modules/log/log.constants";
import { LanguageEntity } from "@shared/modules/locale/entity/language.entity";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

@Injectable()
export class WebAppService {

  constructor(
    @Inject(LOGGER) private readonly logger: Logger,
    @InjectDataSource()
    private readonly dataSource: DataSource) {
  }

  getAvailableLangs() {
    return this.dataSource.getRepository(LanguageEntity).find({
      relations: [
        "icon", "icon.name", "icon.name.lang", "icon.files", "icon.files.format", "icon.type", "icon.type.ext"
      ]
    });
  }

}
