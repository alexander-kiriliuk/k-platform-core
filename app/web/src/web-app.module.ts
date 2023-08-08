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
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";
import { CacheService } from "@shared/modules/cache/cache.types";
import { LoggerOptions } from "typeorm";
import { UserEntity } from "@user/entity/user.entity";
import { UserRoleEntity } from "@user/entity/user-role.entity";
import { MediaEntity } from "@media/entity/media.entity";
import { MediaExtEntity } from "@media/entity/media-ext.entity";
import { MediaFileEntity } from "@media/entity/media-file.entity";
import { MediaFormatEntity } from "@media/entity/media-format.entity";
import { MediaTypeEntity } from "@media/entity/media-type.entity";
import { FileEntity } from "@files/entity/file.entity";
import { ExplorerTargetEntity } from "@explorer/entity/explorer-target.entity";
import { ExplorerColumnEntity } from "@explorer/entity/explorer-column.entity";
import { LanguageEntity } from "@shared/modules/locale/entity/language.entity";
import { LocalizedStringEntity } from "@shared/modules/locale/entity/localized-string.entity";
import { LocalizedMediaEntity } from "@shared/modules/locale/entity/localized-media.entity";
import { UserSubscriber } from "@user/entity/user.subscriber";
import { LocaleSubscriber } from "@shared/modules/locale/entity/locale-subscriber";
import { DbConfig } from "../gen-src/db.config";
import { AuthModule } from "@auth/auth.module";
import { CaptchaModule } from "@captcha/captcha.module";
import { UserModule } from "@user/user.module";
import { ExplorerModule } from "@explorer/explorer.module";
import { ConfigModule } from "@config/config.module";
import { XmlDataBridgeModule } from "@xml-data-bridge/xml-data-bridge.module";

@Module({
  imports: [
    CacheModule,
    LogModule,
    ConfigModule,
    AuthModule.forRoot(),
    FileModule.forRoot(),
    MediaModule.forRoot(),
    CaptchaModule.forRoot(),
    UserModule.forRoot(),
    ExplorerModule.forRoot(),
    XmlDataBridgeModule.forRoot(),
    MulterModule.registerAsync({
      useClass: MulterConfig
    }),
    TypeOrmModule.forRootAsync({
      imports: [CacheModule],
      inject: [CacheService],
      useFactory: async (cs: CacheService) => {
        const opts: TypeOrmModuleOptions = {
          type: await cs.get(DbConfig.TYPE) as any,
          host: await cs.get(DbConfig.HOST),
          schema: await cs.get(DbConfig.SCHEMA),
          port: await cs.getNumber(DbConfig.PORT),
          synchronize: await cs.getBoolean(DbConfig.SYNCHRONIZE),
          logging: await cs.get(DbConfig.LOGGING) as LoggerOptions,
          database: await cs.get(DbConfig.DATABASE),
          username: await cs.get(DbConfig.USERNAME),
          password: await cs.get(DbConfig.PASSWORD),
          entities: [
            UserEntity,
            UserRoleEntity,
            MediaEntity,
            MediaExtEntity,
            MediaFileEntity,
            MediaFormatEntity,
            MediaTypeEntity,
            FileEntity,
            ExplorerTargetEntity,
            ExplorerColumnEntity,
            LanguageEntity,
            LocalizedStringEntity,
            LocalizedMediaEntity
          ],
          migrations: [],
          subscribers: [
            UserSubscriber
          ]
        };
        return opts;
      }
    })
  ],
  controllers: [
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
    LocaleSubscriber
  ]
})
export class WebAppModule implements NestModule {

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(XmlDataBridgeMiddleware)
      .forRoutes(XmlDataBridgeController);
  }

}
