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
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { UserEntity } from "@user/src/entity/user.entity";
import { USER_DATA_SRC, USER_REPOSITORY } from "@user/src/user.constants";
import { DataSource, LoggerOptions } from "typeorm";
import { UserRoleEntity } from "@user/src/entity/user-role.entity";
import { UserSubscriber } from "@user/src/entity/user.subscriber";
import { CacheService } from "@shared/modules/cache/cache.types";
import { CacheModule } from "@shared/modules/cache/cache.module";
import { UserConfig } from "@user/gen-src/user.config";
import { MsClientModule } from "@shared/modules/ms-client/ms-client.module";
import { MS_REPOSITORY_FACTORY } from "@shared/modules/ms-client/ms-client.constants";
import { LogModule } from "@shared/modules/log/log.module";
import { MsRepositoryFactory } from "@shared/modules/ms-client/ms-client.types";

@Module({
  imports: [
    CacheModule,
    MsClientModule,
    LogModule
  ],
  controllers: [UserController],
  providers: [
    UserService,
    {
      provide: USER_DATA_SRC,
      inject: [CacheService],
      useFactory: async (cs: CacheService) => {
        const ds = new DataSource({
          type: await cs.get(UserConfig.DB_TYPE) as any,
          host: await cs.get(UserConfig.DB_HOST),
          schema: await cs.get(UserConfig.DB_SCHEMA),
          port: await cs.getNumber(UserConfig.DB_PORT),
          synchronize: await cs.getBoolean(UserConfig.DB_SYNCHRONIZE),
          logging: await cs.get(UserConfig.DB_LOGGING) as LoggerOptions,
          database: await cs.get(UserConfig.DB_DATABASE),
          username: await cs.get(UserConfig.DB_USERNAME),
          password: await cs.get(UserConfig.DB_PASSWORD),
          entities: [
            UserEntity,
            UserRoleEntity
          ],
          subscribers: [
            UserSubscriber
          ]
        });
        return await ds.initialize();
      }
    },
    {
      provide: USER_REPOSITORY,
      inject: [USER_DATA_SRC, MS_REPOSITORY_FACTORY],
      useFactory: (dataSource: DataSource, factory: MsRepositoryFactory) => {
        const repository = dataSource.getRepository(UserEntity);
        return factory.create(repository);
      }
    }
  ]
})
export class UserModule {
}
