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

import { Process } from "./process.constants";
import { Logger } from "@nestjs/common";
import { ProcessManagerService } from "./process-manager.service";
import { ProcessLogEntity } from "./entity/process.log.entity";
import { ObjectUtils } from "../../shared/utils/object.utils";
import registerProcess = Process.registerProcess;
import Status = Process.Status;
import inspect = ObjectUtils.inspect;
import LogLevel = Process.LogLevel;

export abstract class AbstractProcess {
  protected abstract readonly logger: Logger;
  protected abstract readonly pmService: ProcessManagerService;
  private logInstance: ProcessLogEntity;

  protected abstract execute(): Promise<unknown>;

  protected constructor() {
    registerProcess(this);
  }

  async start() {
    const status = await this.getStatus();
    if (status === Status.Execute) {
      this.logger.warn(
        `Process with id ${this.constructor.name} now executed, can't start that`
      );
      return;
    }
    this.logInstance = await this.pmService.createLogInstance(
      this.constructor.name
    );
    await this.writeLog(`Start process with id ${this.constructor.name}`);
    await this.setStatus(Status.Execute);
    try {
      await this.execute();
      await this.setStatus(Status.Ready);
      await this.onFinish();
      await this.writeLog(
        `Process with id ${this.constructor.name} was finished`
      );
      this.logInstance = undefined;
    } catch (e) {
      await this.setStatus(Status.Crashed);
      await this.onCrash(e);
      await this.writeLog(
        `Process with id ${this.constructor.name} was crashed`,
        e,
        LogLevel.Error
      );
      this.logInstance = undefined;
    }
  }

  async stop() {
    await this.writeLog(`Try to stop process with id ${this.constructor.name}`);
    await this.setStatus(Status.Ready);
    await this.onStop();
    await this.writeLog(`Process with id ${this.constructor.name} was stopped`);
    this.logInstance = undefined;
  }

  protected async writeLog(
    message: string,
    data?: unknown,
    level = LogLevel.Log
  ) {
    switch (level) {
      case LogLevel.Log:
        this.logger.log(message, data);
        break;
      case LogLevel.Error:
        this.logger.error(message, data);
        break;
      case LogLevel.Warn:
        this.logger.warn(message, data);
        break;
      case LogLevel.Debug:
        this.logger.debug(message, data);
        break;
      case LogLevel.Verbose:
        this.logger.verbose(message, data);
        break;
    }
    if (!this.logInstance) {
      return;
    }
    const date = new Date();
    let msg = inspect(message);
    if (
      (msg.startsWith(`'`) && msg.endsWith(`'`)) ||
      (msg.startsWith(`"`) && msg.endsWith(`"`))
    ) {
      msg = msg.substring(1, msg.length - 1);
    }
    if (data) {
      msg += inspect(data);
    }
    msg = msg.replace(/\[/g, "{");
    msg = msg.replace(/]/g, "}");
    this.logInstance.content += `[${process.pid} | ${date.toLocaleString()} | ${level}] ${msg} >>>\n`;
    await this.pmService.updateLogInstance(this.logInstance);
  }

  protected async onFinish() {
    // implement callback in child class if it needs
  }

  protected async onStop() {
    // implement callback in child class if it needs
  }

  protected async onCrash(error: Error) {
    // implement callback in child class if it needs
  }

  private async getStatus() {
    return await this.pmService.getProcessUnitStatus(this.constructor.name);
  }

  private async setStatus(status: Status) {
    await this.pmService.setProcessUnitStatus(this.constructor.name, status);
  }
}
