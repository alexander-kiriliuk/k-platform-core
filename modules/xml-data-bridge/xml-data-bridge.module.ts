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
import { LogModule } from "@shared/modules/log/log.module";
import { FileModule } from "@files/file.module";
import { MediaModule } from "@media/media.module";

import { XdbService } from "@xml-data-bridge/xml-data-bridge.constants";
import { XdbModuleOptions } from "@xml-data-bridge/xml-data-bridge.types";
import { XmlDataBridgeService } from "@xml-data-bridge/xml-data-bridge.service";

@Module({})
export class XmlDataBridgeModule {

  static forRoot(options: XdbModuleOptions = { service: XmlDataBridgeService }): DynamicModule {
    return {
      module: XmlDataBridgeModule,
      imports: [
        LogModule,
        FileModule.forRoot(),
        MediaModule.forRoot()
      ],
      providers: [
        {
          provide: XdbService,
          useClass: options.service
        }
      ],
      exports: [XdbService]
    };
  }

}
