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

import {
  Controller,
  Get,
  NotFoundException,
  Param,
  UseGuards,
} from "@nestjs/common";
import {
  AuthGuard,
  CommonUtils,
  ForRoles,
  ProcessManagerService,
  Roles,
} from "@k-platform/core";
import sleep = CommonUtils.sleep;

@Controller("process")
@UseGuards(AuthGuard)
export class ProcessController {
  constructor(private readonly pmService: ProcessManagerService) {}

  @Get("/start/:code")
  @ForRoles(Roles.ADMIN)
  async startProcess(@Param("code") code: string) {
    await this.pmService.startProcess(code);
  }

  @Get("/stop/:code")
  @ForRoles(Roles.ADMIN)
  async stopProcess(@Param("code") code: string) {
    await this.pmService.stopProcess(code);
  }

  @Get("/toggle/:code")
  @ForRoles(Roles.ADMIN)
  async toggleProcess(@Param("code") code: string) {
    await this.pmService.toggleProcess(code);
  }

  @Get("/stats/:code")
  @ForRoles(Roles.ADMIN)
  async getStats(@Param("code") code: string) {
    const processData = await this.pmService.getProcessData(code, true);
    if (!processData) {
      throw new NotFoundException();
    }
    processData.logs = await this.pmService.getLastLogsByProcess(
      processData.code,
    );
    return processData;
  }

  @Get("/log/:id")
  @ForRoles(Roles.ADMIN)
  async getLogs(@Param("id") id: number) {
    const logData = await this.pmService.getProcessLogById(id);
    if (!logData) {
      throw new NotFoundException();
    }
    for (let i = 0; i < 5; i++) {
      const currentLog = await this.pmService.getProcessLogById(id);
      if (currentLog.tsUpdated.getTime() !== logData.tsUpdated.getTime()) {
        return currentLog;
      }
      await sleep(1000);
    }
  }
}
