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
import registerProcess = Process.registerProcess;
import Status = Process.Status;

export abstract class AbstractProcess {

  protected abstract readonly logger: Logger;
  protected abstract readonly pmService: ProcessManagerService;

  protected abstract execute(): Promise<unknown>;

  private status: Status;

  protected constructor() {
    registerProcess(this);
  }

  async start() {
    this.logger.log(`Start process ${this.constructor.name}`);
    const status = await this.getStatus();
    if (status === Status.Execute) {
      this.logger.warn(`Process ${this.constructor.name} now executed, can't start that`);
      return;
    }
    await this.setStatus(Status.Execute);
    try {
      await this.execute();
      await this.setStatus(Status.Ready);
      this.logger.log(`Process ${this.constructor.name} was finished`);
      await this.onFinish();
    } catch (e) {
      await this.setStatus(Status.Crashed);
      this.logger.error(`Process ${this.constructor.name} was crashed`);
      this.onCrash(e);
    }
  }

  async stop() {
    if (this.status !== Status.Execute) {
      return;
    }
    this.logger.log(`Try to stop process ${this.constructor.name}`);
    await this.setStatus(Status.Ready);
    this.logger.log(`Process ${this.constructor.name} was stopped`);
    this.onStop();
  }

  protected writeLog() {
    // todo
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
    this.status = status;
    await this.pmService.setProcessUnitStatus(this.constructor.name, status);
  }

}
