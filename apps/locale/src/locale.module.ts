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
import { LocaleService } from "./locale.service";
import { CacheService } from "@shared/modules/cache/cache.types";
import { DataSource, LoggerOptions } from "typeorm";
import { LocaleConfig } from "../gen-src/locale.config";
import { LanguageEntity } from "./entity/language.entity";
import { LocalizedStringEntity } from "./entity/localized-string.entity";
import { LocalizedMediaEntity } from "./entity/localized-media.entity";
import { CacheModule } from "@shared/modules/cache/cache.module";
import { MsClientModule } from "@shared/modules/ms-client/ms-client.module";
import { MS_REPOSITORY_FACTORY } from "@shared/modules/ms-client/ms-client.constants";
import { MsRepositoryFactory } from "@shared/modules/ms-client/ms-client.types";
import {
  LANG_REPOSITORY,
  LOCALE_DATA_SRC,
  LOCALIZED_MEDIA_REPOSITORY,
  LOCALIZED_STRING_REPOSITORY
} from "@locale/src/locale.constants";
import { LocaleController } from "@locale/src/locale.controller";

@Module({
  controllers: [LocaleController],
  imports: [
    CacheModule,
    MsClientModule
  ],
  providers: [
    LocaleService,
    {
      provide: LOCALE_DATA_SRC,
      inject: [CacheService],
      useFactory: async (cs: CacheService) => {
        const ds = new DataSource({
          type: await cs.get(LocaleConfig.DB_TYPE) as any,
          host: await cs.get(LocaleConfig.DB_HOST),
          schema: await cs.get(LocaleConfig.DB_SCHEMA),
          port: await cs.getNumber(LocaleConfig.DB_PORT),
          synchronize: await cs.getBoolean(LocaleConfig.DB_SYNCHRONIZE),
          logging: await cs.get(LocaleConfig.DB_LOGGING) as LoggerOptions,
          database: await cs.get(LocaleConfig.DB_DATABASE),
          username: await cs.get(LocaleConfig.DB_USERNAME),
          password: await cs.get(LocaleConfig.DB_PASSWORD),
          entities: [
            LanguageEntity,
            LocalizedStringEntity,
            LocalizedMediaEntity
          ]
        });
        return await ds.initialize();
      }
    },
    {
      provide: LOCALIZED_MEDIA_REPOSITORY,
      inject: [LOCALE_DATA_SRC, MS_REPOSITORY_FACTORY],
      useFactory: (dataSource: DataSource, factory: MsRepositoryFactory) => {
        const repository = dataSource.getRepository(LocalizedMediaEntity);
        return factory.create(repository);
      }
    },
    {
      provide: LOCALIZED_STRING_REPOSITORY,
      inject: [LOCALE_DATA_SRC, MS_REPOSITORY_FACTORY],
      useFactory: (dataSource: DataSource, factory: MsRepositoryFactory) => {
        const repository = dataSource.getRepository(LocalizedStringEntity);
        return factory.create(repository);
      }
    },
    {
      provide: LANG_REPOSITORY,
      inject: [LOCALE_DATA_SRC, MS_REPOSITORY_FACTORY],
      useFactory: (dataSource: DataSource, factory: MsRepositoryFactory) => {
        const repository = dataSource.getRepository(LanguageEntity);
        return factory.create(repository);
      }
    }
  ],
  exports: [
    LocaleService
  ]
})
export class LocaleModule {
}
