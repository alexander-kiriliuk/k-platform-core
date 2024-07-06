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
import { ClientProxy, ClientsModule } from "@nestjs/microservices";
import { LogModule } from "../log/log.module";
import { LOGGER } from "../log/log.constants";
import { MS_CLIENT, MSG_BUS } from "./ms-client.constants";
import { EnvLoader } from "../../utils/env.loader";
import { MsClient } from "./ms-client";

/**
 * A module that provides microservices client functionality for dispatching messages between microservices.
 */
@Module({
  imports: [
    LogModule,
    ClientsModule.registerAsync([
      {
        imports: [LogModule],
        inject: [LOGGER],
        name: MS_CLIENT,
        useFactory: (logger: Logger) => {
          EnvLoader.loadEnvironment(logger);
          return {
            transport: parseInt(process.env.TRANSPORT_TYPE),
            options: {
              host: process.env.TRANSPORT_HOST,
              port: parseInt(process.env.TRANSPORT_PORT),
              timeout: parseInt(process.env.TRANSPORT_TIMEOUT),
            },
          };
        },
      },
    ]),
  ],
  providers: [
    {
      provide: MSG_BUS,
      useFactory: (logger: Logger, client: ClientProxy) =>
        new MsClient(logger, client),
      inject: [LOGGER, MS_CLIENT],
    },
  ],
  exports: [MSG_BUS],
})
export class MsClientModule {}
