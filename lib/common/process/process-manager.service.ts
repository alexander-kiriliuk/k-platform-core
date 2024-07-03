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
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ProcessUnitEntity } from "./entity/process.unit.entity";
import { Process } from "./process.constants";
import { ProcessLogEntity } from "./entity/process.log.entity";
import { WARLOCK } from "../../shared/modules/warlock/warlock.constants";
import { WarlockFn } from "../../shared/modules/warlock/warlock.types";
import { LOGGER } from "../../shared/modules/log/log.constants";
import { MESSAGES_BROKER } from "../../shared/modules/messages-broker/messages-broker.constants";
import { MessagesBroker } from "../../shared/modules/messages-broker/messages-broker.types";
import Status = Process.Status;
import Command = Process.Command;
import hasProcessInstance = Process.hasProcessInstance;

/**
 * Service for managing processes.
 */
@Injectable()
export class ProcessManagerService {
  private static pmInitStatus: boolean;

  constructor(
    @Inject(WARLOCK) private readonly lockExec: WarlockFn,
    @Inject(LOGGER) private readonly logger: Logger,
    @Inject(MESSAGES_BROKER) private readonly broker: MessagesBroker,
    @InjectRepository(ProcessUnitEntity)
    private readonly processUnitRep: Repository<ProcessUnitEntity>,
    @InjectRepository(ProcessLogEntity)
    private readonly processLogRep: Repository<ProcessLogEntity>,
  ) {}

  /**
   * Initializes the process manager service, resets process statuses, and registers processes.
   */
  async init() {
    if (ProcessManagerService.pmInitStatus) {
      this.logger.warn("Autostart processes has been executed");
      return;
    }
    await this.resetAllProcessStatuses();
    this.logger.log("Init process manager");
    ProcessManagerService.pmInitStatus = true;
    const processList = await this.processUnitRep.find({
      where: { enabled: true },
    });
    for (const processData of processList) {
      if (!processData.cronTab?.length) {
        this.logger.warn(
          `Process ${processData.code} hasn't cron-tab, skip job registration`,
        );
        continue;
      }
      this.broker.emit(Command.Register, processData);
    }
  }

  /**
   * Starts a process by its code.
   * @param code - The code of the process to start.
   */
  async startProcess(code: string) {
    const processData = await this.getProcessData(code, true);
    if (!processData) {
      throw new InternalServerErrorException(
        `Process ${code} hasn't options-data`,
      );
    }
    this.broker.emit(Command.Start, processData);
  }

  /**
   * Stops a process by its code.
   * @param code - The code of the process to stop.
   */
  async stopProcess(code: string) {
    const processData = await this.getProcessData(code, true);
    if (!processData) {
      throw new InternalServerErrorException(
        `Process ${code} hasn't options-data`,
      );
    }
    this.broker.emit(Command.Stop, processData);
  }

  /**
   * Toggles the enabled status of a process.
   * @param code - The code of the process to toggle.
   */
  async toggleProcess(code: string) {
    if (!hasProcessInstance(code)) {
      throw new InternalServerErrorException(`Process ${code} not exists`);
    }
    const processData = await this.processUnitRep.findOne({ where: { code } });
    processData.enabled = !processData.enabled;
    await this.processUnitRep.save(processData);
    if (processData.enabled) {
      this.broker.emit(Command.Register, processData);
    } else {
      this.broker.emit(Command.Unregister, processData);
    }
  }

  /**
   * Sets the status of a process unit.
   * @param code - The code of the process unit.
   * @param status - The new status to set.
   */
  async setProcessUnitStatus(code: string, status: Process.Status) {
    const processData = await this.getProcessData(code, true);
    processData.status = status;
    return this.processUnitRep.save(processData);
  }

  /**
   * Gets the status of a process unit.
   * @param code - The code of the process unit.
   * @returns The current status of the process unit.
   */
  async getProcessUnitStatus(code: string) {
    const processData = await this.getProcessData(code, true);
    return processData.status;
  }

  /**
   * Creates a log instance for a process.
   * @param processCode - The code of the process.
   * @returns The created ProcessLogEntity instance.
   */
  async createLogInstance(processCode: string) {
    const process = await this.getProcessData(processCode);
    return this.processLogRep.save({
      process,
      content: "",
    } as ProcessLogEntity);
  }

  /**
   * Updates a log instance.
   * @param logInstance - The ProcessLogEntity instance to update.
   * @returns The updated ProcessLogEntity instance.
   */
  updateLogInstance(logInstance: ProcessLogEntity) {
    return this.processLogRep.save(logInstance);
  }

  /**
   * Gets process data by its code.
   * @param code - The code of the process.
   * @param force - Whether to force getting the process data regardless of its enabled status.
   * @returns The ProcessUnitEntity instance.
   */
  getProcessData(code: string, force = false) {
    const params = { code, enabled: true };
    return this.processUnitRep.findOne({ where: force ? { code } : params });
  }

  /**
   * Gets a process log by its ID.
   * @param id - The ID of the process log.
   * @returns The ProcessLogEntity instance.
   */
  getProcessLogById(id: number) {
    return this.processLogRep.findOne({
      where: { id },
      relations: ["process"],
    });
  }

  /**
   * Gets the last logs of a process by its code.
   * @param processCode - The code of the process.
   * @param limit - The maximum number of logs to retrieve (default is 3).
   * @returns An array of ProcessLogEntity instances.
   */
  getLastLogsByProcess(processCode: string, limit = 3) {
    return this.processLogRep.find({
      where: { process: { code: processCode } },
      take: limit,
      order: { tsUpdated: "DESC" },
    });
  }

  /**
   * Resets the statuses of all enabled processes to "Ready".
   */
  private async resetAllProcessStatuses() {
    const entities = await this.processUnitRep.find({
      where: { enabled: true },
    });
    for (const processData of entities) {
      await this.setProcessUnitStatus(processData.code, Status.Ready);
    }
  }
}
