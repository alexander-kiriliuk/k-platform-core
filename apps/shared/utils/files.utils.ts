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

import { DeSerializedFile, SerializedFile } from "@media/src/media.types";
import { File } from "multer";
import * as fs from "fs";


export namespace FilesUtils {

  /**
   * Deserializes a serialized file into a file object.
   * @param serialized - The serialized file object.
   * @returns The deserialized file object.
   */
  export function deSerializeFile(serialized: SerializedFile) {
    return {
      ...serialized,
      buffer: Buffer.from(serialized.buffer, "base64")
    } as DeSerializedFile;
  }

  /**
   * Serializes a file object into a serialized file.
   * @param file - The file object to serialize.
   * @returns The serialized file object.
   */
  export function serializeFile(file: File) {
    return {
      originalname: file.originalname,
      encoding: file.encoding,
      mimetype: file.mimetype,
      buffer: file.buffer.toString("base64"),
      size: file.size
    } as SerializedFile;
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

}
