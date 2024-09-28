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

import { Logger, MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";
import { MulterConfig } from "./multer.config";
import { Orm } from "./orm.config";
import { AppController } from "./app.controller";
import { WebAppService } from "./web-app.service";
import { HttpModule, HttpService } from "@nestjs/axios";
import {
  AuthModule,
  CacheModule,
  CacheService,
  CaptchaModule,
  CategoryModule,
  ConfigModule,
  ExplorerModule,
  FileModule,
  GoogleCaptchaService,
  GraphicCaptchaService,
  LocaleSubscriber,
  LOGGER,
  LogModule,
  MediaModule,
  ProcessModule,
  TmpDirCleanerProcess,
  UserEntityPwdAndRolesSaveHandler,
  UserModule,
  XmlDataBridgeMiddleware,
  XmlDataBridgeModule,
} from "@k-platform/core";
import { TypeOrmModule } from "@nestjs/typeorm";
import {
  ServeStaticModule,
  ServeStaticModuleOptions,
} from "@nestjs/serve-static";
import { CaptchaConfig } from "@gen-src/captcha.config";
import { KpConfig } from "@gen-src/kp.config";
import { AuthController } from "./default-controllers/auth.controller";
import { CaptchaController } from "./default-controllers/captcha.controller";
import { ConfigController } from "./default-controllers/config.controller";
import { ExplorerController } from "./default-controllers/explorer.controller";
import { FileController } from "./default-controllers/file.controller";
import { MediaController } from "./default-controllers/media.controller";
import { ProcessController } from "./default-controllers/process.controller";
import { ProfileController } from "./default-controllers/profile.controller";
import { XmlDataBridgeController } from "./default-controllers/xml-data-bridge.controller";

@Module({
  imports: [
    CacheModule,
    LogModule,
    ConfigModule.forRoot(),
    CategoryModule,
    ProcessModule,
    AuthModule.forRoot(),
    FileModule.forRoot(),
    MediaModule.forRoot(),
    CaptchaModule.forRootAsync({
      imports: [CacheModule, LogModule, HttpModule],
      inject: [CacheService, LOGGER, HttpService],
      useFactory: async (
        cs: CacheService,
        logger: Logger,
        httpService: HttpService,
      ) => {
        const type = await cs.get(CaptchaConfig.TYPE);
        if (type === "google") {
          logger.log("Set google recaptcha as captcha service");
          return new GoogleCaptchaService(logger, cs, httpService);
        }
        logger.log("Set default captcha service");
        return new GraphicCaptchaService(logger, cs);
      },
    }),
    UserModule.forRoot(),
    ExplorerModule.forRoot({
      saveHandlers: [UserEntityPwdAndRolesSaveHandler],
    }),
    XmlDataBridgeModule.forRoot(),
    TypeOrmModule.forRootAsync(Orm.getOptions()),
    MulterModule.registerAsync({ useClass: MulterConfig }),
    ServeStaticModule.forRootAsync({
      imports: [CacheModule],
      inject: [CacheService],
      useFactory: async (
        cs: CacheService,
      ): Promise<ServeStaticModuleOptions[]> => {
        return [
          {
            rootPath: process.cwd() + (await cs.get(KpConfig.STATIC_FILES)),
          },
        ];
      },
    }),
  ],
  controllers: [
    AppController,
    AuthController,
    CaptchaController,
    ConfigController,
    ExplorerController,
    FileController,
    MediaController,
    ProcessController,
    ProfileController,
    XmlDataBridgeController,
  ],
  providers: [LocaleSubscriber, WebAppService, TmpDirCleanerProcess],
})
export class WebAppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(XmlDataBridgeMiddleware).forRoutes(XmlDataBridgeController);
  }
}
