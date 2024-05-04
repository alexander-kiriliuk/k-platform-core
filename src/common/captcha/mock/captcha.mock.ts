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

import { CaptchaRequest } from "../captcha.types";
import { CAPTCHA_CACHE_PREFIX } from "../captcha.constants";
import { MockStorage } from "../../../shared/modules/mock/mock.storage";
import { CaptchaConfig } from "../../../gen-src/captcha.config";

export namespace CaptchaMock {
  export const validCaptchaRequest: CaptchaRequest = {
    id: "test-id",
    data: "12345"
  };
  export const captchaRequestWithInvalidId: CaptchaRequest = {
    id: "test-wrong-id",
    data: "12345"
  };
  export const captchaRequestWithInvalidData: CaptchaRequest = {
    id: validCaptchaRequest.id,
    data: "12345-wrong"
  };

  export const Storage = new MockStorage([
    {
      key: CaptchaConfig.FONT_PATH,
      data: "/modules/captcha/montserrat.ttf"
    },
    {
      key: CaptchaConfig.FONT_FAMILY,
      data: "Montserrat"
    },
    {
      key: `${CAPTCHA_CACHE_PREFIX}:${validCaptchaRequest.id}`,
      data: validCaptchaRequest.data
    },
    {
      key: `${validCaptchaRequest.id}`,
      data: validCaptchaRequest.data
    },
  ]);
}
