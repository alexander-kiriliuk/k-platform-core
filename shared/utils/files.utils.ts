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
import * as crypto from "crypto";
import { OpenMode } from "node:fs";
import { Abortable } from "node:events";
import * as path from "path";

const fileTypeModule = {} as { lib: typeof import("file-type") };
(async (ft) => {  // crutch for import ES module
  ft.lib = await (eval("import(\"file-type\")") as Promise<typeof import("file-type")>);
})(fileTypeModule);

interface DirectoryStructure {
  [key: string]: string[] | DirectoryStructure;
}

export namespace FilesUtils {

  export function fileType() {
    return fileTypeModule.lib;
  }

  export function getHashFromBuffer(fileBuffer: Buffer) {
    const hashSum = crypto.createHash("sha256");
    hashSum.update(fileBuffer);
    return hashSum.digest("hex");
  }

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

  export async function readDirectoryRecursively(dirPath: string): Promise<DirectoryStructure | string[]> {
    const result: DirectoryStructure = {};

    async function readDir(currentPath: string, relativePath: string): Promise<DirectoryStructure | string[]> {
      const files = await fs.promises.readdir(currentPath);
      const filePromises = files.map(async (file) => {
        const filePath = path.join(currentPath, file);
        const stats = await fs.promises.stat(filePath);
        const newRelativePath = path.join(relativePath, file);
        if (stats.isDirectory()) {
          result[newRelativePath] = await readDir(filePath, newRelativePath);
        } else {
          if (!result[relativePath]) {
            result[relativePath] = [];
          }
          (result[relativePath] as string[]).push(file);
        }
      });
      await Promise.all(filePromises);
      return result[relativePath] || [];
    }

    await readDir(dirPath, "");
    return result;
  }

}
