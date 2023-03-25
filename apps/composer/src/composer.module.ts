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
import { ComposerController } from "./composer.controller";
import { ClientProxy, ClientsModule } from "@nestjs/microservices";
import { MS_CLIENT, REDIS_OPTIONS, TRANSPORT_OPTIONS, TRANSPORT_TYPE } from "@shared/constants";
import { ComposerClient } from "@shared/client-proxy/composer.client";
import { RedisModule } from "@liaoliaots/nestjs-redis";

@Module({
  imports: [
    ClientsModule.register([
      { name: MS_CLIENT, transport: TRANSPORT_TYPE, options: TRANSPORT_OPTIONS },
    ]),
    RedisModule.forRoot({
      config: REDIS_OPTIONS,
    }),
  ],
  controllers: [ComposerController],
  providers: [
    {
      provide: ComposerClient,
      useFactory: (client: ClientProxy) => new ComposerClient(client),
      inject: [MS_CLIENT],
    },
  ],
})
export class ComposerModule {
}
