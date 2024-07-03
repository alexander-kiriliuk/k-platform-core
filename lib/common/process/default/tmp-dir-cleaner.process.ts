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
import { ProcessManagerService } from "../process-manager.service";
import * as fs from "fs";
import { KpConfig } from "../../../../gen-src/kp.config";
import { FilesUtils } from "../../../shared/utils/files.utils";
import { LOGGER } from "../../../shared/modules/log/log.constants";
import { CacheService } from "../../../shared/modules/cache/cache.types";
import readDirectoryRecursively = FilesUtils.readDirectoryRecursively;

/**
 * Process class for cleaning the temporary directory.
 */
export class TmpDirCleanerProcess extends AbstractProcess {
  constructor(
    @Inject(LOGGER) protected readonly logger: Logger,
    protected readonly pmService: ProcessManagerService,
    private readonly cacheService: CacheService,
  ) {
    super();
  }

  /**
   * Executes the process to clean the temporary directory.
   */
  protected async execute() {
    const tmpDir =
      process.cwd() + (await this.cacheService.get(KpConfig.TMP_DIR));
    if (!fs.existsSync(tmpDir)) {
      await this.writeLog(`Nothing to delete`);
      return;
    }
    const dirStruct = await readDirectoryRecursively(tmpDir);
    const stats = this.getDeleteStats(dirStruct as { [k: string]: string[] });
    await this.writeLog(
      `Try to delete ${stats.filesCount} files and ${stats.foldersCount} folders...`,
    );
    await fs.promises.rm(tmpDir, { recursive: true, force: true });
    await this.writeLog(`Tmp dir was cleaned`);
  }

  /**
   * Gets statistics on the number of files and folders to be deleted.
   * @param dirStruct - The structure of the directory.
   * @returns An object containing the file and folder counts.
   */
  private getDeleteStats(dirStruct: { [k: string]: string[] }) {
    let filesCount = 0;
    let foldersCount = 0;
    for (const key in dirStruct) {
      filesCount += dirStruct[key].length;
      if (!key.length) {
        continue;
      }
      foldersCount++;
    }
    return { filesCount, foldersCount };
  }
}
