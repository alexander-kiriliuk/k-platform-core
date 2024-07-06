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

import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LanguageEntity } from "./entity/language.entity";
import { LocalizedStringEntity } from "./entity/localized-string.entity";
import { LocalizedMediaEntity } from "./entity/localized-media.entity";
import { LocaleService } from "./locale.service";

/**
 * A module that provides services and configurations for handling localization.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      LanguageEntity,
      LocalizedStringEntity,
      LocalizedMediaEntity,
    ]),
  ],
  providers: [LocaleService],
  exports: [LocaleService],
})
export class LocaleModule {}
