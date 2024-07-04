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

export namespace TransformUtils {
  /**
   * Converts a Date object to a timestamp.
   * @param value - The Date object to convert.
   * @returns The timestamp.
   */
  export function dateToTime({ value }) {
    if (value instanceof Date) {
      return value.getTime();
    }
    return value;
  }

  /**
   * Parses a parameter string into an object.
   * @param filterString - The parameter string to parse.
   * @returns An object representing the parsed parameters.
   */
  export function parseParamsString(filterString: string): {
    [key: string]: string;
  } {
    const filterObject: { [key: string]: string } = {};
    const filterParts = filterString.split("::");
    if (filterString.startsWith("::")) {
      filterParts.shift();
    }
    for (const part of filterParts) {
      const [key, value] = part.split(":");
      filterObject[key] = value;
    }
    return filterObject;
  }

  /**
   * Stringifies an object into a parameter string.
   * @param filterObject - The object to stringify.
   * @returns The parameter string.
   */
  export function stringifyParamsObject(filterObject: {
    [key: string]: string;
  }): string {
    const filterParts = [];
    for (const key in filterObject) {
      const encodedValue = filterObject[key];
      const filterPart = `${key}:${encodedValue}`;
      filterParts.push(filterPart);
    }
    return "::" + filterParts.join("::");
  }
}
