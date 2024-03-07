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

import { DynamicModule, Module } from "@nestjs/common";
import { GraphicCaptchaService } from "./graphic-captcha.service";
import { CaptchaModuleOptions, CaptchaService } from "./captcha.types";
import { CacheModule } from "@shared/modules/cache/cache.module";
import { LogModule } from "@shared/modules/log/log.module";

@Module({})
export class CaptchaModule {

  static forRoot(options: CaptchaModuleOptions = { service: GraphicCaptchaService }): DynamicModule {
    return {
      module: CaptchaModule,
      imports: [
        CacheModule,
        LogModule
      ],
      providers: [
        {
          provide: CaptchaService,
          useClass: options.service
        }
      ],
      exports: [CaptchaService]
    };
  }

  static forRootAsync(options: {
    inject?: any[];
    imports?: any[];
    useFactory: (...args) => Promise<CaptchaService> | CaptchaService;
  }): DynamicModule {
    const { inject, imports, useFactory } = options;
    return {
      module: CaptchaModule,
      imports: [...(imports || [])],
      providers: [
        {
          provide: CaptchaService,
          useFactory,
          inject
        }
      ],
      exports: [CaptchaService]
    };
  }

}
