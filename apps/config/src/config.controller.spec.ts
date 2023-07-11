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


import { Test, TestingModule } from "@nestjs/testing";
import { LOGGER } from "@shared/modules/log/log.constants";
import { CacheService } from "@shared/modules/cache/cache.types";
import { ConfigController } from "@config/src/config.controller";
import { ConfigService } from "@config/src/config.service";
import { PageableData, PageableParams } from "@shared/modules/pageable/pageable.types";
import { ConfigMock } from "@config/src/mock/config.mock";

describe("ConfigController", () => {

  let configController: ConfigController;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConfigController],
      providers: [
        {
          provide: LOGGER,
          useValue: {}
        },
        {
          provide: CacheService,
          useValue: {}
        },
        {
          provide: ConfigService,
          useValue: {
            getPropertiesPage: jest.fn(),
            setProperty: jest.fn(),
            removeProperty: jest.fn()
          } as Partial<ConfigService>
        }
      ]
    }).compile();
    configController = module.get<ConfigController>(ConfigController);
    configService = module.get<ConfigService>(ConfigService);
  });

  it("props list", async () => {
    const params = new PageableParams();
    jest.spyOn(configService, "getPropertiesPage").mockImplementation(async () => new PageableData(
      [], 10, 1, 5
    ));
    const res = await configController.propsList(params);
    expect(res).toBeInstanceOf(PageableData);
  });

  it("set property", async () => {
    jest.spyOn(configService, "setProperty").mockImplementation(async () => true);
    const res = await configController.setProperty(ConfigMock.testSetProp);
    expect(res).toBeTruthy();
  });

  it("remove property", async () => {
    jest.spyOn(configService, "removeProperty").mockImplementation(async () => true);
    const res = await configController.removeProperty(ConfigMock.testExistedProp);
    expect(res).toBeTruthy();
  });

});
