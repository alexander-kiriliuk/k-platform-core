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
import { CaptchaController } from "./controllers/captcha.controller";
import { MulterModule } from "@nestjs/platform-express";
import { ExplorerController } from "./controllers/explorer.controller";
import { MediaController } from "./controllers/media.controller";
import { FileController } from "./controllers/file.controller";
import { ConfigController } from "./controllers/config.controller";
import { FileModule } from "@files/file.module";
import { MediaModule } from "@media/media.module";
import { MulterConfig } from "./multer.config";
import { XmlDataBridgeController } from "./controllers/xml-data-bridge.controller";
import { XmlDataBridgeMiddleware } from "@xml-data-bridge/xml-data-bridge.middleware";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LocaleSubscriber } from "@shared/modules/locale/entity/locale-subscriber";
import { AuthModule } from "@auth/auth.module";
import { CaptchaModule } from "@captcha/captcha.module";
import { UserModule } from "@user/user.module";
import { ExplorerModule } from "@explorer/explorer.module";
import { ConfigModule } from "@config/config.module";
import { XmlDataBridgeModule } from "@xml-data-bridge/xml-data-bridge.module";
import { Orm } from "./orm.config";
import { ServeStaticModule } from "@nestjs/serve-static";
import { CacheService } from "@shared/modules/cache/cache.types";
import { ServerConfig } from "../gen-src/server.config";
import { ServeStaticModuleOptions } from "@nestjs/serve-static/dist/interfaces/serve-static-options.interface";
import { AppController } from "./controllers/app.controller";
import { WebAppService } from "./web-app.service";
import { CategoryModule } from "@shared/modules/category/category.module";

@Module({
  imports: [
    CacheModule,
    LogModule,
    ConfigModule,
    CategoryModule,
    AuthModule.forRoot(),
    FileModule.forRoot(),
    MediaModule.forRoot(),
    CaptchaModule.forRoot(),
    UserModule.forRoot(),
    ExplorerModule.forRoot(),
    XmlDataBridgeModule.forRoot(),
    TypeOrmModule.forRootAsync(Orm.getOptions()),
    MulterModule.registerAsync({ useClass: MulterConfig }),
    ServeStaticModule.forRootAsync({
      imports: [CacheModule],
      inject: [CacheService],
      useFactory: async (cs: CacheService): Promise<ServeStaticModuleOptions[]> => {
        return [
          {
            rootPath: process.cwd() + await cs.get(ServerConfig.STATIC_FILES)
          }
        ];
      }
    })
  ],
  controllers: [
    AppController,
    AuthController,
    CaptchaController,
    ProfileController,
    ExplorerController,
    MediaController,
    FileController,
    ConfigController,
    XmlDataBridgeController
  ],
  providers: [
    LocaleSubscriber,
    WebAppService
  ]
})
export class WebAppModule implements NestModule {

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(XmlDataBridgeMiddleware)
      .forRoutes(XmlDataBridgeController);
  }

}
