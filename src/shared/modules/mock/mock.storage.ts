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

import * as hash from "object-hash";

/**
 * A mock storage object, used for mock services
 */
export class MockStorage {

  constructor(
    private data: Array<{ data: unknown, key: string, params?: unknown }>) {
  }

  find(key: string, params?: unknown) {
    if (!params) {
      return this.data.find(v => v.key === key);
    }
    const paramsHash = hash(params);
    for (const item of this.data) {
      if (!item.params || item.key !== key) {
        continue;
      }
      if (paramsHash === hash(item.params)) {
        return item;
      }
    }
    return null;
  }

  filter(key: string) {
    const regexPattern = key.split("*").join(".+");
    const regex = new RegExp(`^${regexPattern}$`);
    return this.data.filter(v => regex.test(v.key));
  }

  set(key: string, data: string | number) {
    this.data = this.data.filter(v => v.key !== key);
    this.data.push({ key, data });
  }

  remove(key: string) {
    this.data = this.data.filter(v => v.key !== key);
  }

}
