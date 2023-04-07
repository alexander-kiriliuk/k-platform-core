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

import { Injectable } from "@nestjs/common";
import { DeSerializedFile } from "@media/src/media.types";

@Injectable()
export class MediaService {

  async upload(deserializedFiles: DeSerializedFile[], type: string) {
    console.log(deserializedFiles);
    // TODO
    return Promise.resolve(1);
  }

  async findById(id: string) {
    // TODO
    return Promise.resolve(1);
  }

  async remove(id: string) {
    // TODO
    return Promise.resolve(1);
  }

}
