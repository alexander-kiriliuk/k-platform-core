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

import { Logger, Module } from "@nestjs/common";
import { RedisModule } from "@liaoliaots/nestjs-redis";
import { RedisCacheService } from "@shared/modules/cache/redis-cache.service";
import { LogModule } from "@shared/modules/log/log.module";
import { CacheService } from "@shared/modules/cache/cache.types";
import * as process from "process";
import { LOGGER } from "@shared/modules/log/log.constants";
import { EnvLoader } from "@shared/utils/env.loader";

@Module({
  imports: [
    RedisModule.forRootAsync({
      imports: [LogModule],
      inject: [LOGGER],
      useFactory: (logger: Logger) => {
        EnvLoader.loadEnvironment(logger);
        return {
          config: {
            host: process.env.REDIS_HOST,
            port: parseInt(process.env.REDIS_PORT),
            db: parseInt(process.env.REDIS_DB),
            username: process.env.REDIS_USER,
            password: process.env.REDIS_PASSWORD
          }
        };
      }
    }),
    LogModule
  ],
  providers: [
    {
      provide: CacheService,
      useClass: RedisCacheService
    }
  ],
  exports: [
    CacheService
  ]
})
export class CacheModule {
}
