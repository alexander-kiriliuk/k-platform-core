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

import { DynamicModule } from "@nestjs/common";
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";
import { CacheModule } from "@shared/modules/cache/cache.module";
import { CacheService } from "@shared/modules/cache/cache.types";
import { DbConfig } from "@shared/modules/db/gen-src/db.config";
import { LoggerOptions } from "typeorm";
import { MediaEntity } from "@media/src/entity/media.entity";
import { MediaExtEntity } from "@media/src/entity/media-ext.entity";
import { MediaFileEntity } from "@media/src/entity/media-file.entity";
import { MediaFormatEntity } from "@media/src/entity/media-format.entity";
import { MediaTypeEntity } from "@media/src/entity/media-type.entity";
import { ExplorerTargetEntity } from "@explorer/src/entity/explorer-target.entity";
import { ExplorerColumnEntity } from "@explorer/src/entity/explorer-column.entity";
import { LanguageEntity } from "@shared/modules/locale/entity/language.entity";
import { LocalizedStringEntity } from "@shared/modules/locale/entity/localized-string.entity";
import { LocalizedMediaEntity } from "@shared/modules/locale/entity/localized-media.entity";
import { LogModule } from "@shared/modules/log/log.module";
import { LocaleSubscriber } from "@shared/modules/locale/entity/locale-subscriber";
import { FileEntity } from "@files/src/entity/file.entity";

/**
 * A class representing a database module with static methods to configure and register the database.
 */
export class DbModule {
  static forRoot(): DynamicModule {
    return {
      module: DbModule,
      providers: [
        LocaleSubscriber
      ],
      imports: [
        LogModule,
        TypeOrmModule.forRootAsync({
          imports: [CacheModule],
          inject: [CacheService],
          useFactory: async (cs: CacheService) => {
            const opts: TypeOrmModuleOptions = {
              type: await cs.get(DbConfig.TYPE) as any,
              host: await cs.get(DbConfig.HOST),
              schema: await cs.get(DbConfig.SCHEMA),
              port: await cs.getNumber(DbConfig.PORT),
              synchronize: await cs.getBoolean(DbConfig.SYNCHRONIZE),
              logging: await cs.get(DbConfig.LOGGING) as LoggerOptions,
              database: await cs.get(DbConfig.DATABASE),
              username: await cs.get(DbConfig.USERNAME),
              password: await cs.get(DbConfig.PASSWORD),
              entities: [
                /*UserEntity,
                UserRoleEntity,*/
                MediaEntity,
                MediaExtEntity,
                MediaFileEntity,
                MediaFormatEntity,
                MediaTypeEntity,
                FileEntity,
                ExplorerTargetEntity,
                ExplorerColumnEntity,
                LanguageEntity,
                LocalizedStringEntity,
                LocalizedMediaEntity
              ],
              migrations: [],
              subscribers: [
                // UserSubscriber
              ]
            };
            return opts;
          }
        })
      ]
    };
  }
}
