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

/**
 * Object to hold the dynamically imported file-type module.
 */
const fileTypeModule = {} as { lib: typeof import("file-type") };

/**
 * Immediately Invoked Function Expression (IIFE) to dynamically import the ES module 'file-type'.
 * @param {object} ft - The fileTypeModule object.
 */
(async (ft) => {
  // crutch for import ES module
  ft.lib = await (eval('import("file-type")') as Promise<
    typeof import("file-type")
  >);
})(fileTypeModule);

/**
 * An interface representing a structure of directories and files.
 * The keys are directory names, and the values are either arrays of file names or nested DirectoryStructure objects.
 */
interface DirectoryStructure {
  [key: string]: string[] | DirectoryStructure;
}

export namespace FilesUtils {
  /**
   * Gets the file type module.
   * @returns The file type module.
   */
  export function fileType() {
    return fileTypeModule.lib;
  }

  /**
   * Generates an SHA-256 hash from a buffer.
   * @param fileBuffer - The buffer to hash.
   * @returns The SHA-256 hash as a hex string.
   */
  export function getHashFromBuffer(fileBuffer: Buffer) {
    const hashSum = crypto.createHash("sha256");
    hashSum.update(fileBuffer);
    return hashSum.digest("hex");
  }

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

  /**
   * Reads a file.
   * @param path - The path of the file to read.
   * @param options - Optional read options.
   * @returns The file contents as a buffer.
   */
  export async function readFile(
    path: string,
    options?:
      | ({
          encoding?: null | undefined;
          flag?: OpenMode | undefined;
        } & Abortable)
      | null,
  ) {
    return await fs.promises.readFile(path);
  }

  /**
   * Recursively reads a directory and returns its structure.
   * @param dirPath - The path of the directory to read.
   * @returns A promise that resolves to the directory structure.
   */
  export async function readDirectoryRecursively(
    dirPath: string,
  ): Promise<DirectoryStructure | string[]> {
    const result: DirectoryStructure = {};

    async function readDir(
      currentPath: string,
      relativePath: string,
    ): Promise<DirectoryStructure | string[]> {
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
