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
import { ExplorerTargetEntity } from "@explorer/src/entity/explorer-target.entity";
import { ExplorerColumnEntity } from "@explorer/src/entity/explorer-column.entity";
import { TypeOrmModuleOptions } from "@nestjs/typeorm/dist/interfaces/typeorm-options.interface";
import { LanguageEntity } from "@shared/modules/locale/entity/language.entity";
import { LocalizedStringEntity } from "@shared/modules/locale/entity/localized-string.entity";
import { LocalizedMediaEntity } from "@shared/modules/locale/entity/localized-media.entity";
import { RedisClientOptions } from "@liaoliaots/nestjs-redis/dist/redis/interfaces/redis-module-options.interface";
import { UserSubscriber } from "@user/src/entity/user-subscriber";
import { DbConfig } from "@shared/modules/db/gen-src/db.config";
import { MediaExtEntity } from "@media/src/entity/media-ext.entity";


export const MS_EXCEPTION_ID = "MsException";

export const TRANSPORT_TYPE = Transport.REDIS;

export const TRANSPORT_OPTIONS = {
  host: "localhost",
  port: 6379,
  timeout: 10000,
};

export const API = {
  prefix: "api/v1",
  port: 3001,
};

export const REDIS_OPTIONS: RedisClientOptions = {
  host: "localhost",
  port: 6379,
  db: 0,
};

export const REQUEST_PROPS = {
  accessToken: "accessToken",
  currentUser: "currentUser",
};

export const PG_DATA_SOURCE: TypeOrmModuleOptions = {
  type: DbConfig.TYPE,
  host: DbConfig.HOST,
  schema: DbConfig.SCHEMA,
  port: DbConfig.PORT,
  synchronize: DbConfig.SYNCHRONIZE,
  logging: DbConfig.LOGGING as LoggerOptions,
  database: DbConfig.DATABASE,
  username: DbConfig.USERNAME,
  password: String(DbConfig.PASSWORD),
  entities: [
    UserEntity,
    UserRoleEntity,
    MediaEntity,
    MediaExtEntity,
    MediaFileEntity,
    MediaSizeEntity,
    MediaTypeEntity,
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

