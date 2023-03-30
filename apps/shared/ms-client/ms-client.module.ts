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
import { MS_CLIENT, TRANSPORT_OPTIONS, TRANSPORT_TYPE } from "@shared/constants";
import { ClientProxy, ClientsModule } from "@nestjs/microservices";
import { MsClient } from "@shared/ms-client/ms-client";
import { LOGGER } from "@shared/modules/log/log.constants";

@Module({
  imports: [
    LogModule,
    ClientsModule.register([
      { name: MS_CLIENT, transport: TRANSPORT_TYPE, options: TRANSPORT_OPTIONS },
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
