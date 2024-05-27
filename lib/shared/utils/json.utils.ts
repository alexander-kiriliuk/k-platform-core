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

export namespace JsonUtils {
  export function jsonFilter(key, value) {
    if (value === null || (Array.isArray(value) && !value.length)) {
      return undefined;
    }
    return removeCircularReferences(value);
  }

  function removeCircularReferences(value, cache = new Set()) {
    if (
      !(value instanceof Date) &&
      typeof value === "object" &&
      value !== null
    ) {
      if (cache.has(value)) {
        return null;
      }
      cache.add(value);
      if (Array.isArray(value)) {
        const newArray = [];
        for (const item of value) {
          newArray.push(removeCircularReferences(item, cache));
        }
        return newArray;
      }
      const newObject = {};
      for (const key in value) {
        newObject[key] = removeCircularReferences(value[key], cache);
      }
      return newObject;
    }
    return value;
  }
}
