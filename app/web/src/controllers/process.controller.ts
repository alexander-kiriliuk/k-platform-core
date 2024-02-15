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

import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@shared/guards/auth.guard";
import { ForRoles } from "@shared/decorators/for-roles.decorator";
import { Roles } from "@shared/constants";
import { ProcessManagerService } from "../../../../modules/process/process-manager.service";


@Controller("process")
@UseGuards(AuthGuard)
export class ProcessController {

  constructor(
    private readonly pmService: ProcessManagerService) {
  }

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

}
