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

import { DynamicModule, Module } from "@nestjs/common";
import { MediaService } from "./media.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MediaEntity } from "./entity/media.entity";
import { MediaTypeEntity } from "./entity/media-type.entity";
import { MediaFileEntity } from "./entity/media-file.entity";
import { MediaFormatEntity } from "./entity/media-format.entity";
import { MediaManager, MediaModuleOptions } from "./media.types";
import { FileModule } from "../file/file.module";
import { LogModule } from "../../shared/modules/log/log.module";
import { CacheModule } from "../../shared/modules/cache/cache.module";
import { MediaController } from "./media.controller";
import { UserModule } from "../user/user.module";

/**
 * Module for management media system.
 */
@Module({})
export class MediaModule {
  static forRoot(
    options: MediaModuleOptions = {
      service: MediaService,
      controller: MediaController,
    },
  ): DynamicModule {
    return {
      module: MediaModule,
      controllers: [options.controller],
      imports: [
        TypeOrmModule.forFeature([
          MediaEntity,
          MediaTypeEntity,
          MediaFileEntity,
          MediaFormatEntity,
        ]),
        UserModule.forRoot(),
        FileModule.forRoot(),
        LogModule,
        CacheModule,
      ],
      providers: [
        {
          provide: MediaManager,
          useClass: options.service,
        },
      ],
      exports: [MediaManager],
    };
  }
}
