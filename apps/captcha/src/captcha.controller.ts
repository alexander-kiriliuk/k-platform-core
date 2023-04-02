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

import { Controller } from "@nestjs/common";
import { MessagePattern } from "@nestjs/microservices";
import { CaptchaRequest, CaptchaService } from "./captcha.types";


@Controller()
export class CaptchaController {

  constructor(
    private readonly captchaService: CaptchaService) {
  }

  @MessagePattern("captcha.generate")
  async generate() {
    return await this.captchaService.generateCaptcha();
  }

  @MessagePattern("captcha.validate")
  async validate(request: CaptchaRequest) {
    return await this.captchaService.validateCaptcha(request);
  }

}
