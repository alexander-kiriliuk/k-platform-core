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
import { RedisModule } from "@liaoliaots/nestjs-redis";
import { REDIS_OPTIONS } from "@shared/constants";
import { RedisCacheService } from "@shared/modules/cache/redis-cache.service";
import { LogModule } from "@shared/modules/logger/log.module";
import { CACHE_SERVICE } from "@shared/modules/cache/cache.types";

@Module({
  imports: [
    RedisModule.forRoot({
      config: REDIS_OPTIONS,
    }),
    LogModule,
  ],
  providers: [
    {
      provide: CACHE_SERVICE,
      useClass: RedisCacheService,
    },
  ],
  exports: [
    CACHE_SERVICE,
  ],
})
export class CacheModule {
}
