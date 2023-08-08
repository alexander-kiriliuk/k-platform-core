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
import { FileService } from "./file.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FileEntity } from "./entity/file.entity";
import { LogModule } from "@shared/modules/log/log.module";
import { CacheModule } from "@shared/modules/cache/cache.module";
import { FileManager } from "@files/file.constants";
import { FileModuleOptions } from "@files/file.types";

@Module({})
export class FileModule {

  static forRoot(options: FileModuleOptions = {
    service: FileService,
    entities: [FileEntity]
  }): DynamicModule {
    return {
      module: FileModule,
      imports: [
        TypeOrmModule.forFeature(options.entities),
        LogModule,
        CacheModule
      ],
      providers: [
        {
          provide: FileManager,
          useClass: options.service
        }
      ],
      exports: [FileManager]
    };
  }

}
