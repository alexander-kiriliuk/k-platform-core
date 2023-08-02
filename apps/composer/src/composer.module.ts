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

import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ProfileController } from "./controllers/profile.controller";
import { AuthController } from "./controllers/auth.controller";
import { CacheModule } from "@shared/modules/cache/cache.module";
import { LogModule } from "@shared/modules/log/log.module";
import { MsClientModule } from "@shared/modules/ms-client/ms-client.module";
import { CaptchaController } from "./controllers/captcha.controller";
import { ExplorerController } from "./controllers/explorer.controller";
import { MediaController } from "./controllers/media.controller";
import { MulterConfig } from "./multer.config";
import { MulterModule } from "@nestjs/platform-express";
import { ConfigController } from "./controllers/config.controller";
import { FileController } from "./controllers/file.controller";
import { FileModule } from "@files/src/file.module";
import { MediaModule } from "@media/src/media.module";
import { XmlDataBridgeController } from "./controllers/xml-data-bridge.controller";
import { XmlDataBridgeMiddleware } from "@xml-data-bridge/src/xml-data-bridge.middleware";
import { LocaleController } from "./controllers/locale.controller";

@Module({
  controllers: [
    AuthController,
    CaptchaController,
    ProfileController,
    ExplorerController,
    MediaController,
    FileController,
    ConfigController,
    XmlDataBridgeController,
    LocaleController
  ],
  imports: [
    CacheModule,
    LogModule,
    FileModule,
    MediaModule,
    MsClientModule,
    MulterModule.registerAsync({
      useClass: MulterConfig
    })
  ]
})
export class ComposerModule implements NestModule {

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(XmlDataBridgeMiddleware)
      .forRoutes(XmlDataBridgeController);
  }

}
