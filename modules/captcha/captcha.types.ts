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

export abstract class CaptchaService<CaptchaBody = any> {

  abstract generateCaptcha(): Promise<CaptchaBody>;

  abstract validateCaptcha(request: CaptchaRequest): Promise<boolean>;

}

export class CaptchaRequest<T = any> {

  @IsString()
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  data: T;

}

export type GraphicCaptchaResponse = {
  type?: string;
  image?: string;
  id?: string;
  enabled?: boolean;
}


export type CaptchaModuleOptions = {
  service: Class<CaptchaService>
};