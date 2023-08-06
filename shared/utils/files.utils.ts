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

import * as fs from "fs";
import { OpenMode } from "node:fs";
import { Abortable } from "node:events";


export namespace FilesUtils {

  /**
   * Creates directories if they do not exist.
   * @param directoryPath - The path of the directory to create.
   */
  export async function createDirectoriesIfNotExist(directoryPath: string) {
    try {
      await fs.promises.access(directoryPath);
    } catch (error) {
      await fs.promises.mkdir(directoryPath, { recursive: true });
    }
  }

  export async function readFile(path: string, options?: | ({
    encoding?: null | undefined;
    flag?: OpenMode | undefined;
  } & Abortable) | null) {
    return await fs.promises.readFile(path);
  }

}
