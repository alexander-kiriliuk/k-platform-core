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

import { DynamicModule, Logger, Module } from "@nestjs/common";
import { Redis } from "ioredis";
import { REDIS_CLIENT } from "./cache.constants";
import { EnvLoader } from "../../utils/env.loader";

@Module({})
export class RedisModule {
  private static redisInstance: Redis | null = null;

  static forRootAsync(options: {
    inject?: any[];
    imports?: any[];
    useFactory: (...args) => {
      config: {
        host: string;
        port: number;
        db: number;
        username: string;
        password: string;
      };
    };
  }): DynamicModule {
    const { inject, imports, useFactory } = options;
    return {
      module: RedisModule,
      imports: [...(imports || [])],
      providers: [
        {
          provide: REDIS_CLIENT,
          useFactory: async (...args: any[]) => {
            if (!RedisModule.redisInstance) {
              const logger = args.find((arg) => arg instanceof Logger);
              EnvLoader.loadEnvironment(logger);
              const redisOptions = useFactory(...args).config;
              RedisModule.redisInstance = new Redis(redisOptions);
            }
            return RedisModule.redisInstance;
          },
          inject
        },
      ],
      exports: [REDIS_CLIENT]
    };
  }
}
