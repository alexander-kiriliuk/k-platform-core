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
import { LogModule } from "@shared/modules/log/log.module";
import { ClientProxy, ClientsModule } from "@nestjs/microservices";
import { MsClient } from "@shared/modules/ms-client/ms-client";
import { LOGGER } from "@shared/modules/log/log.constants";
import { MS_CLIENT } from "@shared/modules/ms-client/ms-client.constants";
import { EnvLoader } from "@shared/utils/env.loader";

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
      provide: MsClient,
      useFactory: (logger: Logger, client: ClientProxy) => new MsClient(logger, client),
      inject: [LOGGER, MS_CLIENT],
    },
  ],
  exports: [
    MsClient,
  ],
})
export class MsClientModule {
}
