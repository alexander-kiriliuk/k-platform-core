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


import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { GraphicCaptchaService } from "./graphic-captcha.service";
import { MockCacheService } from "../../shared/modules/cache/mock/mock-cache.service";
import { CaptchaMock } from "./mock/captcha.mock";
import { LoggerMock } from "../../shared/modules/mock/logger.mock";

describe("GraphicCaptchaService", () => {

  let captchaService: GraphicCaptchaService;
  let cacheService: MockCacheService;

  beforeEach(async () => {
    cacheService = new MockCacheService(CaptchaMock.Storage);
    captchaService = new GraphicCaptchaService(LoggerMock, cacheService);
  });

  it("generate captcha image", async () => {
    const res = await captchaService.generateCaptcha();
    expect(res).toBeDefined();
    expect(res).toHaveProperty("id");
    expect(res).toHaveProperty("image");
    expect(typeof res.id).toBe("string");
    expect(typeof res.image).toBe("string");
  });

  it("failed validate captcha with wrong id", async () => {
    await expect(captchaService.validateCaptcha(CaptchaMock.captchaRequestWithInvalidId))
      .rejects.toThrow(BadRequestException);
  });

  it("failed validate captcha with wrong data value", async () => {
    await expect(captchaService.validateCaptcha(CaptchaMock.captchaRequestWithInvalidData))
      .rejects.toThrow(ForbiddenException);
  });

  it("success validate captcha", async () => {
    const res = await captchaService.validateCaptcha(CaptchaMock.validCaptchaRequest);
    expect(res).toBeDefined();
    expect(res).toBe(true);
  });

});

