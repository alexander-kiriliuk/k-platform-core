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


import { AbstractProcess } from "../abstract-process";
import { Inject, Logger } from "@nestjs/common";
import { LOGGER } from "@shared/modules/log/log.constants";
import { ProcessManagerService } from "../process-manager.service";
import { NumberUtils } from "@shared/utils/number.utils";
import { Process } from "../process.constants";
import generateRandomInt = NumberUtils.generateRandomInt;
import LogLevel = Process.LogLevel;

export class TmpDirCleanerProcess extends AbstractProcess {

  private timerId: any; // todo remove
  // todo try two process in different modules

  constructor(
    @Inject(LOGGER) protected readonly logger: Logger,
    protected readonly pmService: ProcessManagerService) {
    super();
  }

  protected async execute() {
    return new Promise(resolve => {
      /*this.logger.error("pid: " + process.pid);
      resolve(true);*/
      let i = 0;
      this.timerId = setInterval(async () => {
        i++;
        await this.writeLog(generateRandomInt().toString(), undefined, LogLevel.Verbose);
        if (i >= 10) {
          clearInterval(this.timerId);
          resolve(true);
        }
      }, 3000);
    });
  }

  protected async onStop() {
    clearInterval(this.timerId);
    await this.writeLog("Call to child class inside onStop");
  }

  protected async onFinish() {
    clearInterval(this.timerId);
    await this.writeLog("Call to child class inside onFinish");
  }

}
