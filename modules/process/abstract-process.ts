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

export abstract class AbstractProcess {

  protected abstract readonly logger: Logger;
  protected abstract readonly pmService: ProcessManagerService;

  protected abstract execute(): Promise<unknown>;

  protected constructor() {
    registerProcess(this);
  }

  async start() {
    this.logger.log(`Start process ${this.constructor.name}`);
    try {
      await this.execute();
      await this.onFinish();
    } catch (e) {
      this.logger.error(`Process ${this.constructor.name} was crashed`);
      this.onCrash(e);
    }
  }

  async stop() {
    this.logger.log(`Try to stop process ${this.constructor.name}`);
    this.onStop();
  }

  protected writeLog() {
    // todo
  }

  protected onFinish() {
    // todo write status and other
    this.logger.log(`Process ${this.constructor.name} was finished`);
    return undefined;
  }

  protected onStop() {
    // todo write status and other
    this.logger.log(`Process ${this.constructor.name} was stopped`);
    return undefined;
  }

  protected onCrash(e: Error) {
    // todo write status and other
    return undefined;
  }

}
