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

import { Media } from "@media/src/media.types";
import { LocalizedString } from "@shared/modules/locale/locale.types";

export interface Type {
  id: number;
  code: string;
  name: LocalizedString[];
  description: LocalizedString[];
  category: TypeCategory;
  image: Media;
}

export interface TypeCategory {
  id: number;
  code: string;
  name: LocalizedString[];
}