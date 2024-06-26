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

import * as util from "util";

export namespace ObjectUtils {
  /**
   * Inspects an object and returns a string representation of it.
   * @param obj - The object to inspect.
   * @returns A string representation of the object.
   */
  export function inspect<T = any>(obj: T) {
    return util.inspect(obj, { showHidden: false, depth: null });
  }

  /**
   * Sorts array of objects.
   * @param obj - The object to sort.
   * @param property - name of property by sorting
   * @param vector - sorting order
   * @returns A string representation of the object.
   */
  export function sort<T = any>(
    obj: Array<T>,
    property: string,
    vector = true,
  ) {
    obj?.sort((a: T, b: T) => {
      if (!vector) {
        if (a[property] < b[property]) {
          return -1;
        }
        if (a[property] > b[property]) {
          return 1;
        }
      } else {
        if (a[property] > b[property]) {
          return -1;
        }
        if (a[property] < b[property]) {
          return 1;
        }
      }
      return 0;
    });
  }
}
