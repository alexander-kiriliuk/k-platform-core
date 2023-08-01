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


import { SetMetadata } from "@nestjs/common";
import { MsDependencyOptions, MsDependencyParams } from "@shared/modules/ms-client/ms-client.types";
import {
  DEFAULT_MSD_PARAM_KEY,
  DEFAULT_MSD_PARAM_TIMEOUT,
  MsDependencyMetadataKey
} from "@shared/modules/ms-client/ms-client.constants";


export const MsDependencies = <T>(params: MsDependencyOptions<T>): ClassDecorator => {
  Object.entries(params).forEach((entry: [string, MsDependencyParams]) => {
    if (!entry[1].key) {
      entry[1].key = DEFAULT_MSD_PARAM_KEY;
    }
    if (!entry[1].timeout) {
      entry[1].timeout = DEFAULT_MSD_PARAM_TIMEOUT;
    }
  });
  return SetMetadata(MsDependencyMetadataKey, params);
};
