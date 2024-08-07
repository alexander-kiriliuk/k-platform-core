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

import { ValueTransformer } from "typeorm/decorator/options/ValueTransformer";

/**
 * A ValueTransformer for transforming JSON data in a database column.
 * This transformer is used to automatically parse JSON strings from the database into JavaScript objects and vice versa.
 */
export const SimpleJsonTransformer: ValueTransformer = {
  from(value: string | object) {
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch (e) {
        return undefined;
      }
    }
    return value;
  },
  to(value: object) {
    return value;
  },
};
