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
import { MESSAGES_BROKER } from "./messages-broker.constants";
import { RedisModule } from "../cache/redis.module";
import { LogModule } from "../log/log.module";
import { LOGGER } from "../log/log.constants";
import { EnvLoader } from "../../utils/env.loader";
import { MessagesBrokerService } from "./messages-broker.service";

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
    })
  ],
  providers: [
    {
      provide: MESSAGES_BROKER,
      useClass: MessagesBrokerService
    }
  ],
  exports: [
    MESSAGES_BROKER
  ]
})
export class MessagesBrokerModule {
}
