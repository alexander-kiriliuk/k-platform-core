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
import registerProcess = Process.registerProcess;
import Status = Process.Status;

export abstract class AbstractProcess {

  protected abstract readonly logger: Logger;
  currentStatus: Status;

  protected constructor() {
    registerProcess(this);
  }

  async start() {
    this.logger.debug(`Start process ${this.constructor.name}`);
    this.currentStatus = Status.Execute;
    // todo
  }

  async finish() {
    this.logger.debug(`Finish process ${this.constructor.name}`);
    this.currentStatus = Status.Ready;
    // todo
  }

  async stop() {
    this.logger.debug(`Stop process ${this.constructor.name}`);
    this.currentStatus = Status.Ready;
    // todo
  }

  async crash(error: Error) {
    this.logger.error(`Crash process ${this.constructor.name}`, error);
    this.currentStatus = Status.Crashed;
    // todo
  }

}
