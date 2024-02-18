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

import { Inject, Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ProcessUnitEntity } from "./entity/process.unit.entity";
import { LOGGER } from "@shared/modules/log/log.constants";
import { Process } from "./process.constants";
import getRegisteredProcesses = Process.getRegisteredProcesses;

@Injectable()
export class ProcessManagerService {

  private autoStarExecuted: boolean;

  constructor(
    @InjectRepository(ProcessUnitEntity)
    private readonly processUnitRep: Repository<ProcessUnitEntity>,
    @Inject(LOGGER) private readonly logger: Logger) {
    // todo use task scheduling
    // todo use warlock
  }

  async init() {
    if (this.autoStarExecuted) {
      this.logger.warn("Autostart processes has been executed");
      return;
    }
    this.logger.log("Try to exec autostart processes");
    this.autoStarExecuted = true;
    const processList = await this.processUnitRep.find({ where: { execOnStart: true, enabled: true } });
    processList.forEach(processData => this.getProcessInstance(processData.code).start());
  }

  async startProcess(code: string) {
    const processData = await this.getProcessData(code);
    if (!processData) {
      throw new InternalServerErrorException(`Process ${code} hasn't options-data`);
    }
    const process = this.getProcessInstance(code);
    processData.status = Process.Status.Execute;
    await this.processUnitRep.save(processData);
    process.start();
  }

  async stopProcess(code: string) {
    const process = this.getProcessInstance(code);
    process.stop();
    const processData = await this.getProcessData(code);
    if (!processData) {
      throw new InternalServerErrorException(`Process ${code} hasn't options-data`);
    }
    processData.status = Process.Status.Ready;
    await this.processUnitRep.save(processData);
  }

  async toggleProcess(code: string) {
    const process = this.getProcessInstance(code);
    if (!process) {
      throw new InternalServerErrorException(`Process ${code} not exists`);
    }
    const processData = await this.processUnitRep.findOne({ where: { code } });
    if (processData.status === Process.Status.Execute) {
      throw new InternalServerErrorException(`Process ${code} now execute`);
    }
    processData.enabled = !processData.enabled;
    await this.processUnitRep.save(processData);
    // todo register or unregister cron
    if (processData.enabled && processData.execOnStart) {
      this.startProcess(code);
    }
  }


  private getProcessData(code: string) {
    return this.processUnitRep.findOne({ where: { code, enabled: true } });
  }

  private getProcessInstance(code: string) {
    const registeredProcesses = getRegisteredProcesses();
    const process = registeredProcesses.get(code);
    if (!process) {
      throw new InternalServerErrorException(`Process ${code} not registered`);
    }
    return process;
  }

}
