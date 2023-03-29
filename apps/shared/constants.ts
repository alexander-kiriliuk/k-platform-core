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

import { Transport } from "@nestjs/microservices";
import { LoggerOptions } from "typeorm";
import { UserEntity } from "@user/src/entity/user.entity";
import { UserRoleEntity } from "@user/src/entity/user-role.entity";
import { MediaEntity } from "@media/src/entity/media.entity";
import { MediaFileEntity } from "@media/src/entity/media-file.entity";
import { MediaSizeEntity } from "@media/src/entity/media-size.entity";
import { MediaTypeEntity } from "@media/src/entity/media-type.entity";
import { TypeEntity } from "@shared/modules/type/entity/type.entity";
import { TypeCategoryEntity } from "@shared/modules/type/entity/type-category.entity";
import { ExplorerTargetEntity } from "@explorer/src/entity/explorer-target.entity";
import { ExplorerColumnEntity } from "@explorer/src/entity/explorer-column.entity";
import { TypeOrmModuleOptions } from "@nestjs/typeorm/dist/interfaces/typeorm-options.interface";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DynamicModule } from "@nestjs/common";
import { LanguageEntity } from "@shared/modules/locale/entity/language.entity";
import { LocalizedStringEntity } from "@shared/modules/locale/entity/localized-string.entity";
import { LocalizedMediaEntity } from "@shared/modules/locale/entity/localized-media.entity";
import { RedisClientOptions } from "@liaoliaots/nestjs-redis/dist/redis/interfaces/redis-module-options.interface";
import { UserSubscriber } from "@user/src/entity/user-subscriber";

export const MS_CLIENT = "MS_CLIENT";

export const API = {
  prefix: "api/v1",
  port: 3001,
};

export const TRANSPORT_TYPE = Transport.REDIS;

export const TRANSPORT_OPTIONS = {
  host: "localhost",
  port: 6379,
  timeout: 10000,
};

export const REDIS_OPTIONS: RedisClientOptions = {
  host: "localhost",
  port: 6379,
  db: 0,
};

export const JWT = {
  secret: "yourSecretKey",
  redisPrefix: "jwt",
  accessTokenPrefix: "access_token",
  accessTokenExpiration: 600,
  refreshTokenPrefix: "refresh_token",
  refreshTokenExpiration: 600 * 6,
};

export const UNKNOWN_IP = "unknown";

export const BRUTEFORCE = {
  enabled: true,
  redisPrefix: "bruteforce",
  maxAttempts: 3,
  blockDuration: 300,
};

export const PWD_SALT = 10;

export const REQUEST_PROPS = {
  accessToken: "accessToken",
  currentUser: "currentUser",
};

export const PG_DATA_SOURCE: TypeOrmModuleOptions = {
  type: "postgres",
  host: "localhost",
  schema: "core",
  port: 5432,
  synchronize: true,
  logging: "error" as LoggerOptions,
  database: "k_platform",
  username: "root",
  password: "1111",
  entities: [
    UserEntity,
    UserRoleEntity,
    MediaEntity,
    MediaFileEntity,
    MediaSizeEntity,
    MediaTypeEntity,
    TypeEntity,
    TypeCategoryEntity,
    ExplorerTargetEntity,
    ExplorerColumnEntity,
    LanguageEntity,
    LocalizedStringEntity,
    LocalizedMediaEntity,
  ],
  migrations: [],
  subscribers: [
    UserSubscriber,
  ],
};

export class DatabaseModule {
  static forRoot(): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [
        TypeOrmModule.forRoot(PG_DATA_SOURCE),
      ],
    };
  }
}
