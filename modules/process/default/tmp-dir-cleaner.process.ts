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
import { NumberUtils } from "@shared/utils/number.utils";
import { ProcessManagerService } from "../process-manager.service";
import generateRandomInt = NumberUtils.generateRandomInt;

export class TmpDirCleanerProcess extends AbstractProcess {

  private timerId: any; // todo remove

  constructor(
    @Inject(LOGGER) protected readonly logger: Logger,
    protected readonly pmService: ProcessManagerService) {
    super();
  }

  protected async execute() {
    return new Promise(resolve => {
      let i = 0;
      this.timerId = setInterval(() => {
        i++;
        this.logger.verbose(generateRandomInt());
        if (i >= 25) {
          clearInterval(this.timerId);
          resolve(true);
        }
      }, 1000);
    });
  }

  protected onStop(): void {
    super.onStop();
    clearInterval(this.timerId);
  }

  protected onFinish(): void {
    super.onFinish();
    clearInterval(this.timerId);
  }

}
