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

import { FileEntity } from "./entity/file.entity";
import { FileMetadataEntity } from "./entity/file-metadata.entity";
import { File } from "./file.types";

export abstract class FileManager {
  abstract createOrUpdateFile(
    file: Buffer,
    extension: string,
    isPublic: boolean,
    code?: string,
    existedEntityId?: number,
    name?: string,
  ): Promise<FileEntity>;

  abstract findByCode(code: string): Promise<FileEntity>;

  abstract findFileById(id: number): Promise<FileEntity>;

  abstract findPublicById(id: number): Promise<FileEntity>;

  abstract findPrivateById(id: number): Promise<FileEntity>;

  abstract getFilePath(file: File): Promise<string>;

  abstract remove(id: number): Promise<FileEntity>;
}

export abstract class FileMd {
  abstract createFileMetadataEntity(
    buf: Buffer,
    filePath?: string,
  ): Promise<FileMetadataEntity>;
}
