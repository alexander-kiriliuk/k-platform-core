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

import { Controller } from "@nestjs/common";
import { MediaService } from "./media.service";
import { MessagePattern } from "@nestjs/microservices";
import { DeSerializedFile, UploadMediaRequest } from "@media/src/media.types";
import { FileUtils } from "@shared/utils/file.utils";
import deSerializeFile = FileUtils.deSerializeFile;


@Controller()
export class MediaController {

  constructor(
    private readonly mediaService: MediaService) {
  }

  @MessagePattern("media.upload")
  async uploadMedia(payload: UploadMediaRequest) {
    const deserializedFiles: DeSerializedFile[] = payload.files.map(file => deSerializeFile(file));
    return await this.mediaService.upload(deserializedFiles, payload.type);
  }

  @MessagePattern("media.get.by.id")
  async findMediaById(id: string) {
    return await this.mediaService.findById(id);
  }

  @MessagePattern("media.remove")
  async removeMedia(id: string) {
    return await this.mediaService.remove(id);
  }

}
