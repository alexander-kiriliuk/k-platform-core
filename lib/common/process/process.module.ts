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

import { Global, Module, OnApplicationBootstrap } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProcessUnitEntity } from "./entity/process.unit.entity";
import { ProcessManagerService } from "./process-manager.service";
import { ScheduleModule } from "@nestjs/schedule";
import { ProcessRegisterService } from "./process-register.service";
import { ProcessLogEntity } from "./entity/process.log.entity";
import { LogModule } from "../../shared/modules/log/log.module";
import { MessagesBrokerModule } from "../../shared/modules/messages-broker/messages-broker.module";
import { WarlockModule } from "../../shared/modules/warlock/warlock.module";

/**
 * Module is responsible for initializing and managing processes in the application.
 * It uses the NestJS lifecycle hook `onApplicationBootstrap` to initialize processes on startup.
 */
@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([ProcessUnitEntity, ProcessLogEntity]),
    ScheduleModule.forRoot(),
    LogModule,
    MessagesBrokerModule,
    WarlockModule,
  ],
  providers: [ProcessManagerService, ProcessRegisterService],
  exports: [ProcessManagerService],
})
export class ProcessModule implements OnApplicationBootstrap {
  constructor(private readonly pmService: ProcessManagerService) {}

  async onApplicationBootstrap() {
    await this.pmService.init();
  }
}
