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
import { ServeStaticModuleOptions } from "@nestjs/serve-static/dist/interfaces/serve-static-options.interface";
import { AppController } from "./controllers/app.controller";
import { WebAppService } from "./web-app.service";
import { CategoryModule } from "@shared/modules/category/category.module";
import { UserEntityPwdAndRolesSaveHandler } from "@explorer/handlers/user-entity-pwd-and-roles.save-handler";
import { Explorer } from "@explorer/explorer.constants";
import { KpConfig } from "../../../gen-src/kp.config";
import { ProcessModule } from "../../../modules/process/process.module";
import { TmpDirCleanerProcess } from "../../../modules/process/default/tmp-dir-cleaner.process";
import { ProcessController } from "./controllers/process.controller";
import { LOGGER } from "@shared/modules/log/log.constants";
import { GraphicCaptchaService } from "@captcha/graphic-captcha.service";
import { CaptchaConfig } from "@captcha/gen-src/captcha.config";
import { GoogleCaptchaService } from "@captcha/google-captcha.service";
import { HttpModule, HttpService } from "@nestjs/axios";
import ENTITY_SAVE_HANDLER = Explorer.ENTITY_SAVE_HANDLER;

@Module({
  imports: [
    CacheModule,
    LogModule,
    ConfigModule,
    CategoryModule,
    ProcessModule,
    AuthModule.forRoot(),
    FileModule.forRoot(),
    MediaModule.forRoot(),
    CaptchaModule.forRootAsync({
      imports: [
        CacheModule,
        LogModule,
        HttpModule
      ],
      inject: [CacheService, LOGGER, HttpService],
      useFactory: async (cs: CacheService, logger: Logger, httpService: HttpService) => {
        const type = await cs.get(CaptchaConfig.TYPE);
        if (type === "google") {
          logger.log("Set google recaptcha as captcha service");
          return new GoogleCaptchaService(logger, cs, httpService);
        }
        logger.log("Set default captcha service");
        return new GraphicCaptchaService(logger, cs);
      }
    }),
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
            rootPath: process.cwd() + await cs.get(KpConfig.STATIC_FILES)
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
    XmlDataBridgeController,
    ProcessController
  ],
  providers: [
    LocaleSubscriber,
    WebAppService,
    UserEntityPwdAndRolesSaveHandler,
    TmpDirCleanerProcess,
    {
      provide: ENTITY_SAVE_HANDLER,
      useFactory: (h1: UserEntityPwdAndRolesSaveHandler) => [h1],
      inject: [UserEntityPwdAndRolesSaveHandler]
    }
  ]
})
export class WebAppModule implements NestModule {

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(XmlDataBridgeMiddleware)
      .forRoutes(XmlDataBridgeController);
  }

}
