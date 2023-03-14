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

import { Type } from "@shared/type/type";

export interface Media {
  id: number;
  code: string;
  name: string;
  type: MediaType;
  files: MediaFile[];
}

export interface MediaType {
  id: number;
  code: string;
  name: string;
  vp6: boolean;
  ext: Type;
  sizes: MediaSize[];
}

export interface MediaSize {
  id: number;
  code: string;
  name: string;
  width: string;
  height: string;
}

export interface MediaFile {
  id: number;
  code: string;
  name: string;
  width: number;
  height: number;
  format: string;
  size: number;
  media: Media;
}
