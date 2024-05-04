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

export namespace NumberUtils {
  /**
   * Generates a random integer between the given minimum and maximum values (inclusive).
   * @param max - The maximum value of the random integer (default: Number.MAX_SAFE_INTEGER).
   * @param min - The minimum value of the random integer (default: 0).
   * @returns A random integer between the specified min and max values.
   */
  export function generateRandomInt(max = Number.MAX_SAFE_INTEGER, min = 0) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
