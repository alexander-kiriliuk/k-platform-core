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

import { CaptchaRequest, CaptchaResponse, CaptchaService } from "./captcha.types";
import { Inject, Logger } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { lastValueFrom } from "rxjs";
import { LOGGER } from "../../shared/modules/log/log.constants";
import { CacheService } from "../../shared/modules/cache/cache.types";
import { CaptchaConfig } from "../../gen-src/captcha.config";

export class GoogleCaptchaService extends CaptchaService<CaptchaResponse> {
  constructor(
    @Inject(LOGGER) private readonly logger: Logger,
    private readonly cacheService: CacheService,
    private readonly http: HttpService
  ) {
    super();
  }

  async generateCaptcha(): Promise<CaptchaResponse> {
    const captchaEnabled = await this.cacheService.getBoolean(
      CaptchaConfig.ENABLED
    );
    if (!captchaEnabled) {
      return undefined;
    }
    const id = await this.cacheService.get(CaptchaConfig.GOOGLE_PUBLIC_KEY);
    return { id, type: "google" };
  }

  async validateCaptcha(request: CaptchaRequest): Promise<boolean> {
    const secretKey = await this.cacheService.get(
      CaptchaConfig.GOOGLE_SECRET_KEY
    );
    const response$ = await this.http.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${request.data}`
    );
    const response = await lastValueFrom(response$);
    return response?.data?.success;
  }
}
