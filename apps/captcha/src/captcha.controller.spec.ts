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
import { CaptchaController } from "@captcha/src/captcha.controller";
import { CaptchaService, GraphicCaptchaResponse } from "@captcha/src/captcha.types";
import { CaptchaMock } from "@captcha/src/mock/captcha.mock";

describe("CaptchaController", () => {

  let captchaController: CaptchaController;
  let captchaService: CaptchaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CaptchaController],
      providers: [
        {
          provide: CaptchaService,
          useValue: {
            validateCaptcha: jest.fn(),
            generateCaptcha: jest.fn()
          } as CaptchaService
        },
        {
          provide: LOGGER,
          useValue: {}
        },
        {
          provide: CacheService,
          useValue: {}
        }
      ]
    }).compile();
    captchaController = module.get<CaptchaController>(CaptchaController);
    captchaService = module.get<CaptchaService>(CaptchaService);
  });

  it("generate captcha", async () => {
    const captchaResponse: GraphicCaptchaResponse = { id: "test-id", image: "test-image" };
    jest.spyOn(captchaService, "generateCaptcha").mockImplementation(async () => captchaResponse);
    const res = await captchaController.generate();
    expect(res).toBe(captchaResponse);
  });

  it("validate captcha", async () => {
    jest.spyOn(captchaService, "validateCaptcha").mockImplementation(async () => true);
    const res = await captchaController.validate(CaptchaMock.validCaptchaRequest);
    expect(res).toBe(true);
  });

});