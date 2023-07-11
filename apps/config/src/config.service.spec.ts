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


import { ConfigService } from "@config/src/config.service";
import { MockCacheService } from "@shared/modules/cache/mock/mock-cache.service";
import { LoggerMock } from "@shared/modules/mock/logger.mock";
import { ConfigMock } from "@config/src/mock/config.mock";
import { CONFIG_CACHE_PREFIX, PROPERTIES_FILE_EXT_PATTERN } from "@config/src/config.constants";
import * as fs from "fs";

jest.mock("fs", () => ({
  promises: {
    readdir: jest.fn(),
    readFile: jest.fn(),
    unlink: jest.fn(),
    mkdir: jest.fn(),
    writeFile: jest.fn()
  },
  existsSync: jest.fn()
}));

describe("ConfigService", () => {

  let configService: ConfigService;
  let cacheService: MockCacheService;

  beforeEach(async () => {
    cacheService = new MockCacheService(ConfigMock.Storage);
    configService = new ConfigService(LoggerMock, cacheService);
  });

  it("get properties page with pagination params", async () => {
    const res = await configService.getPropertiesPage({ page: 1, limit: 5 });
    expect(res.items).toHaveLength(5);
    expect(res.totalCount).toBe(10);
  });

  it("set property", async () => {
    await configService.setProperty(ConfigMock.testSetProp);
    const result = await cacheService.get(`${CONFIG_CACHE_PREFIX}:${ConfigMock.testSetProp.key}`);
    expect(result).toEqual(ConfigMock.testSetProp.value);
  });

  it("remove property", async () => {
    let existedProp = await cacheService.get(`${CONFIG_CACHE_PREFIX}:${ConfigMock.testExistedProp}`);
    expect(existedProp).toEqual(ConfigMock.testExistedProp);
    await configService.removeProperty(ConfigMock.testExistedProp);
    existedProp = await cacheService.get(`${CONFIG_CACHE_PREFIX}:${ConfigMock.testExistedProp}`);
    expect(existedProp).toEqual(undefined);
  });

  it("call init with properties files", async () => {
    (fs.promises.readdir as jest.Mock).mockResolvedValue([
      {
        isFile: () => true,
        isDirectory: () => false,
        name: PROPERTIES_FILE_EXT_PATTERN
      }
    ]);
    (fs.promises.readFile as jest.Mock).mockResolvedValue("test=true");
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    await configService.initWithPropertiesFiles();
  });

});
