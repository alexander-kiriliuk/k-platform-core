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

import { CaptchaRequest, CaptchaService, GraphicCaptchaResponse } from "./captcha.types";
import { v4 as uuidv4 } from "uuid";
import { Inject, Logger } from "@nestjs/common";
import { CacheService } from "@shared/modules/cache/cache.types";
import { StringUtils } from "@shared/utils/string.utils";
import { CaptchaConfig } from "@captcha/gen-src/captcha.config";
import { BadRequestMsException } from "@shared/exceptions/bad-request-ms.exception";
import { ForbiddenMsException } from "@shared/exceptions/forbidden-ms.exception";
import { createCanvas, registerFont } from "canvas";
import { NumberUtils } from "@shared/utils/number.utils";
import { LOGGER } from "@shared/modules/log/log.constants";
import * as process from "process";
import { CAPTCHA_CACHE_PREFIX } from "@captcha/src/captcha.constants";
import generateRandomString = StringUtils.generateRandomString;
import generateRandomInt = NumberUtils.generateRandomInt;

export class GraphicCaptchaService extends CaptchaService<GraphicCaptchaResponse> {

  private captchaExp: number;
  private captchaFontFamily: string;
  private captchaFontPath: string;

  constructor(
    @Inject(LOGGER) private readonly logger: Logger,
    private readonly cacheService: CacheService) {
    super();
    this.initOptions();
  }

  async generateCaptcha(): Promise<GraphicCaptchaResponse> {
    const id = uuidv4();
    const val = generateRandomString(5, 7);
    const image = await this.makeImageFromText(val);
    await this.cacheService.set(`${CAPTCHA_CACHE_PREFIX}:${id}`, val, this.captchaExp);
    this.logger.debug(`Generated captcha with id: ${id} and value: ${val}`);
    return { id, image };
  }

  async validateCaptcha(request: CaptchaRequest): Promise<boolean> {
    const key = `${CAPTCHA_CACHE_PREFIX}:${request.id}`;
    const val = await this.cacheService.get(key);
    if (!val) {
      this.logger.warn(`Invalid captcha id: ${request.id}`);
      throw new BadRequestMsException();
    }
    if (val !== request.data) {
      this.logger.warn(`Incorrect captcha value for id: ${request.id}`);
      throw new ForbiddenMsException();
    }
    this.cacheService.del(key);
    return true;
  }

  private async initOptions() {
    this.captchaExp = await this.cacheService.getNumber(CaptchaConfig.EXPIRATION);
    this.captchaFontFamily = await this.cacheService.get(CaptchaConfig.FONT_FAMILY);
    this.captchaFontPath = await this.cacheService.get(CaptchaConfig.FONT_PATH);
  }

  private async makeImageFromText(text: string) {
    const canvas = createCanvas(200, 50);
    const ctx = canvas.getContext("2d");
    registerFont(process.cwd() + this.captchaFontPath, { family: this.captchaFontFamily });
    ctx.fillStyle = this.generateColor();
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = `30px ${this.captchaFontFamily}`;
    ctx.textBaseline = "middle";
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      ctx.fillStyle = this.generateColor();
      ctx.fillText(
        char,
        (i * canvas.width) / text.length + Math.random() * 10 - 5,
        canvas.height / 2 + Math.random() * 10 - 5,
      );
    }
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = this.generateColor();
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }
    return canvas.toBuffer().toString("base64");
  }

  private generateColor() {
    return `rgb(${generateRandomInt(255)},${generateRandomInt(255)},${generateRandomInt(255)})`;
  }

}
