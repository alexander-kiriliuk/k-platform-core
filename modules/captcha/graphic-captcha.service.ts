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
import { BadRequestException, ForbiddenException, Inject, Logger } from "@nestjs/common";
import { CacheService } from "@shared/modules/cache/cache.types";
import { StringUtils } from "@shared/utils/string.utils";
import { CaptchaConfig } from "@captcha/gen-src/captcha.config";
import { createCanvas, registerFont } from "canvas";
import { NumberUtils } from "@shared/utils/number.utils";
import { LOGGER } from "@shared/modules/log/log.constants";
import { CAPTCHA_CACHE_PREFIX } from "./captcha.constants";
import * as path from "path";
import generateRandomString = StringUtils.generateRandomString;
import generateRandomInt = NumberUtils.generateRandomInt;

/**
 * The GraphicCaptchaService class extends the CaptchaService class with a specialization for graphical captchas.
 * It manages the generation and validation of graphic captchas.
 */
export class GraphicCaptchaService extends CaptchaService<GraphicCaptchaResponse> {

  /**
   * @param {Logger} logger - An instance of Logger.
   * @param {CacheService} cacheService - An instance of CacheService.
   */
  constructor(
    @Inject(LOGGER) private readonly logger: Logger,
    private readonly cacheService: CacheService) {
    super();
  }

  /**
   * Generates a new graphical captcha and stores it in the cache.
   * @returns {Promise<GraphicCaptchaResponse>} - A promise resolving to a GraphicCaptchaResponse object containing the captcha id and image.
   */
  async generateCaptcha(): Promise<GraphicCaptchaResponse> {
    const captchaEnabled = await this.cacheService.getBoolean(CaptchaConfig.ENABLED);
    if (!captchaEnabled) {
      return undefined;
    }
    const id = uuidv4();
    const val = generateRandomString(5, 7);
    const image = await this.makeImageFromText(val);
    const capEx = await this.getCaptchaExp();
    await this.cacheService.set(`${CAPTCHA_CACHE_PREFIX}:${id}`, val, capEx);
    this.logger.debug(`Generated captcha with id: ${id} and value: ${val}`);
    return { id, image, type: "default" };
  }

  /**
   * Validates the provided captcha request against the cached value.
   * @param {CaptchaRequest} request - The captcha request to be validated.
   * @returns {Promise<boolean>} - A promise resolving to a boolean indicating whether the captcha is valid or not.
   * @throws {BadRequestException} - Thrown when the captcha id is invalid.
   * @throws {ForbiddenException} - Thrown when the captcha value is incorrect.
   */
  async validateCaptcha(request: CaptchaRequest): Promise<boolean> {
    const key = `${CAPTCHA_CACHE_PREFIX}:${request.id}`;
    const val = await this.cacheService.get(key);
    this.cacheService.del(key);
    if (!val) {
      this.logger.warn(`Invalid captcha id: ${request.id}`);
      return false;
    }
    if (val !== request.data) {
      this.logger.warn(`Incorrect captcha value for id: ${request.id}`);
      return false;
    }
    return true;
  }

  /**
   * Generates an image from the provided text.
   * @param {string} text - The text to be drawn on the image.
   * @returns {Promise<string>} - A promise resolving to a base64 encoded image.
   * @private
   */
  private async makeImageFromText(text: string) {
    const canvas = createCanvas(200, 50);
    const ctx = canvas.getContext("2d");
    const capFontFamily = await this.getCaptchaFontFamily();
    const capFontPath = await this.getCaptchaFontPath();
    registerFont(capFontPath, { family: capFontFamily });
    ctx.fillStyle = this.generateColor();
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = `30px ${capFontFamily}`;
    ctx.textBaseline = "middle";
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      ctx.fillStyle = this.generateColor();
      ctx.fillText(
        char,
        (i * canvas.width) / text.length + Math.random() * 10 - 5,
        canvas.height / 2 + Math.random() * 10 - 5
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

  /**
   * Generates a random RGB color.
   * @returns {string} - An RGB color string.
   * @private
   */
  private generateColor() {
    return `rgb(${generateRandomInt(255)},${generateRandomInt(255)},${generateRandomInt(255)})`;
  }

  private async getCaptchaExp() {
    return await this.cacheService.getNumber(CaptchaConfig.EXPIRATION);
  }

  private async getCaptchaFontFamily() {
    return await this.cacheService.get(CaptchaConfig.FONT_FAMILY);
  }

  private async getCaptchaFontPath() {
    const dir = process.cwd() + await this.cacheService.get(CaptchaConfig.FONT_PATH);
    return path.normalize(dir);
  }

}
