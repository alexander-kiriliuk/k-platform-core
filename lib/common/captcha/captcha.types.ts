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

import { IsNotEmpty, IsString } from "class-validator";
import { Type as Class } from "@nestjs/common/interfaces/type.interface";

/**
 * Abstract class representing a CAPTCHA service.
 * @template CaptchaBody Type of data returned when generating CAPTCHA.
 */
export abstract class CaptchaService<CaptchaBody = any> {
  /**
   * Generates a CAPTCHA.
   * @returns {Promise<CaptchaBody>} A promise that resolves with the CAPTCHA data.
   */
  abstract generateCaptcha(): Promise<CaptchaBody>;

  /**
   * Validates a CAPTCHA.
   * @param {CaptchaRequest} request The data for validate the CAPTCHA.
   * @returns {Promise<boolean>} A promise that resolves with the validation result (true if the CAPTCHA is valid).
   */
  abstract validateCaptcha(request: CaptchaRequest): Promise<boolean>;
}

/**
 * Data transfer object for validate the CAPTCHA.
 * @template T Type of the CAPTCHA data.
 */
export class CaptchaRequest<T = any> {
  /**
   * The unique identifier for the CAPTCHA.
   */
  @IsString()
  @IsNotEmpty()
  id: string;

  /**
   * The data associated with the CAPTCHA request.
   */
  @IsNotEmpty()
  data: T;
}

/**
 * Type representing a CAPTCHA response for client side.
 */
export type CaptchaResponse = {
  /**
   * The type of the CAPTCHA.
   */
  type?: string;

  /**
   * The image data for the CAPTCHA.
   */
  image?: string;

  /**
   * The unique identifier for the CAPTCHA.
   */
  id?: string;

  /**
   * Whether the CAPTCHA is enabled in configuration.
   */
  enabled?: boolean;
};

export interface BasicCaptchaController {
  validateCaptcha(payload: CaptchaRequest): Promise<{ result: unknown }>;

  getCaptcha(): Promise<CaptchaResponse>;
}

/**
 * Options for configuring the CAPTCHA module.
 */
export type CaptchaModuleOptions = {
  service: Class<CaptchaService>;
  controller: Class<BasicCaptchaController>;
};
