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

import { Body, Controller, Get, Inject, Post } from "@nestjs/common";
import { CaptchaRequest, GraphicCaptchaResponse } from "@captcha/src/captcha.types";
import { MSG_BUS } from "@shared/modules/ms-client/ms-client.constants";
import { MessageBus } from "@shared/modules/ms-client/ms-client.types";

@Controller("/captcha")
export class CaptchaController {

  constructor(
    @Inject(MSG_BUS) private readonly bus: MessageBus) {
  }

  @Post("/validate")
  async validateCaptcha(@Body() payload: CaptchaRequest) {
    const result = await this.bus.dispatch<boolean, CaptchaRequest>("captcha.validate", payload);
    return { result };
  }

  @Get("/")
  async getCaptcha() {
    const captcha: GraphicCaptchaResponse = await this.bus.dispatch<GraphicCaptchaResponse>("captcha.generate");
    return {
      id: captcha.id,
      image: `data:image/png;base64,${captcha.image}`
    };
  }

}
