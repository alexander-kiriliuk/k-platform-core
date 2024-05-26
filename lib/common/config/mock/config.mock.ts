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

import { ConfigItem } from "../config.types";
import { MockStorage } from "../../../shared/modules/mock/mock.storage";
import { CONFIG_CACHE_PREFIX } from "../config.constants";

export namespace ConfigMock {
  export const testSetProp: ConfigItem = {
    key: "test_set_k",
    value: "test_val",
  };
  export const testExistedProp = "val_1";

  export const Storage = new MockStorage([
    {
      key: `${CONFIG_CACHE_PREFIX}:${testExistedProp}`,
      data: testExistedProp,
    },
    {
      key: `${CONFIG_CACHE_PREFIX}:val_2`,
      data: "val_2",
    },
    {
      key: `${CONFIG_CACHE_PREFIX}:val_3`,
      data: "val_3",
    },
    {
      key: `${CONFIG_CACHE_PREFIX}:val_4`,
      data: "val_4",
    },
    {
      key: `${CONFIG_CACHE_PREFIX}:val_5`,
      data: "val_5",
    },
    {
      key: `${CONFIG_CACHE_PREFIX}:val_6`,
      data: "val_6",
    },
    {
      key: `${CONFIG_CACHE_PREFIX}:val_7`,
      data: "val_7",
    },
    {
      key: `${CONFIG_CACHE_PREFIX}:val_8`,
      data: "val_8",
    },
    {
      key: `${CONFIG_CACHE_PREFIX}:val_9`,
      data: "val_9",
    },
    {
      key: `${CONFIG_CACHE_PREFIX}:val_10`,
      data: "val_10",
    },
  ]);
}
