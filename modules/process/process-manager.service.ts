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
import { SchedulerRegistry } from "@nestjs/schedule";
import { CronJob } from "cron/dist/job";
import getRegisteredProcesses = Process.getRegisteredProcesses;
import Status = Process.Status;

@Injectable()
export class ProcessManagerService {

  private static pmInitStatus: boolean;

  constructor(
    @InjectRepository(ProcessUnitEntity)
    private readonly processUnitRep: Repository<ProcessUnitEntity>,
    @Inject(LOGGER) private readonly logger: Logger,
    private readonly schedulerRegistry: SchedulerRegistry) {
    // todo use warlock and test cluster
  }

  async init() {
    if (ProcessManagerService.pmInitStatus) {
      this.logger.warn("Autostart processes has been executed");
      return;
    }
    await this.resetAllProcessStatuses();
    this.logger.log("Init process manager, try to exec autostart processes");
    ProcessManagerService.pmInitStatus = true;
    const processList = await this.processUnitRep.find({ where: { enabled: true } });
    for (const processData of processList) {
      if (processData.execOnStart) {
        const processInstance = this.getProcessInstance(processData.code);
        processInstance.start();
      }
      if (!processData.cronTab?.length) {
        this.logger.warn(`Process ${processData.code} hasn't cron-tab, skip job registration`);
        continue;
      }
      this.registerCronJob(processData);
    }
  }

  async startProcess(code: string) {
    const processData = await this.getProcessData(code, true);
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
    const processData = await this.getProcessData(code, true);
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
    processData.enabled = !processData.enabled;
    await this.processUnitRep.save(processData);
    if (processData.enabled) {
      await this.registerCronJob(processData);
    } else {
      await this.unregisterCronJob(processData);
    }
    /*if (processData.enabled && processData.execOnStart) {
      this.startProcess(code);
    }*/
  }

  async setProcessUnitStatus(code: string, status: Process.Status) {
    const processData = await this.getProcessData(code, true);
    processData.status = status;
    return this.processUnitRep.save(processData);
  }

  async getProcessUnitStatus(code: string) {
    const processData = await this.getProcessData(code, true);
    return processData.status;
  }

  private async registerCronJob(processData: ProcessUnitEntity) {
    if (this.schedulerRegistry.doesExist("cron", processData.code)) {
      this.logger.warn(`Can't register cron job with code ${processData.code}, that already exists`);
      return;
    }
    await this.setProcessUnitStatus(processData.code, Status.Ready);
    const processInstance = this.getProcessInstance(processData.code);
    if (!processData.cronTab?.length) {
      this.logger.warn(`Process ${processData.code} hasn't cron-tab, skip job registration`);
      return;
    }
    const job = new CronJob(processData.cronTab, () => {
      processInstance.start();
    });
    job.start();
    this.schedulerRegistry.addCronJob(processData.code, job);
  }

  private async unregisterCronJob(processData: ProcessUnitEntity) {
    if (!this.schedulerRegistry.doesExist("cron", processData.code)) {
      this.logger.warn(`Can't unregister cron job with code ${processData.code}`);
      return;
    }
    const job = this.schedulerRegistry.getCronJob(processData.code);
    job.stop();
    this.schedulerRegistry.deleteCronJob(processData.code);
    this.stopProcess(processData.code);
  }

  private getProcessData(code: string, force = false) {
    const params = { code, enabled: true };
    return this.processUnitRep.findOne({ where: force ? { code } : params });
  }

  private getProcessInstance(code: string) {
    const registeredProcesses = getRegisteredProcesses();
    const process = registeredProcesses.get(code);
    if (!process) {
      throw new InternalServerErrorException(`Process ${code} not registered`);
    }
    return process;
  }

  private async resetAllProcessStatuses() {
    const entities = await this.processUnitRep.find({ where: { enabled: true } });
    for (const processData of entities) {
      await this.setProcessUnitStatus(processData.code, Status.Ready);
    }
  }

}
