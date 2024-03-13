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

import { CacheModule } from "@shared/modules/cache/cache.module";
import { CacheService } from "@shared/modules/cache/cache.types";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { DbConfig } from "../gen-src/db.config";
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
import { TypeOrmModuleAsyncOptions } from "@nestjs/typeorm/dist/interfaces/typeorm-options.interface";
import { CategoryEntity } from "@shared/modules/category/entity/category.entity";
import { ExplorerColumnRendererEntity } from "@explorer/entity/explorer-column-renderer.entity";
import { ExplorerTabEntity } from "@explorer/entity/explorer-tab.entity";
import { ExplorerActionEntity } from "@explorer/entity/explorer-action.entity";
import { WebAppMenuRestrictionEntity } from "./entity/web-app-menu-restriction.entity";
import { ProcessUnitEntity } from "../../../modules/process/entity/process.unit.entity";
import { ProcessLogEntity } from "../../../modules/process/entity/process.log.entity";
import { IccFileMetadataEntity } from "@files/entity/icc-file-metadata.entity";
import { ImageFileMetadataEntity } from "@files/entity/image-file-metadata.entity";
import { FileMetadataEntity } from "@files/entity/file-metadata.entity";
import { ExifFileMetadataEntity } from "@files/entity/exif-file-metadata.entity";
import { GpsFileMetadataEntity } from "@files/entity/gps-file-metadata.entity";
import { AudioFileMetadataEntity } from "@files/entity/audio-file-metadata.entity";
import { VideoFileMetadataEntity } from "@files/entity/video-file-metadata.entity";

export namespace Orm {

  export function getOptions(synchronize = false): TypeOrmModuleAsyncOptions {
    return {
      imports: [CacheModule],
      inject: [CacheService],
      useFactory: async (cs: CacheService) => {
        const opts: TypeOrmModuleOptions = {
          type: await cs.get(DbConfig.TYPE) as any,
          host: await cs.get(DbConfig.HOST),
          port: await cs.getNumber(DbConfig.PORT),
          synchronize: synchronize === true ? synchronize : await cs.getBoolean(DbConfig.SYNCHRONIZE),
          logging: await cs.get(DbConfig.LOGGING) as LoggerOptions,
          database: await cs.get(DbConfig.DATABASE),
          username: await cs.get(DbConfig.USERNAME),
          password: await cs.get(DbConfig.PASSWORD),
          entities: [
            ProcessUnitEntity,
            ProcessLogEntity,
            UserEntity,
            UserRoleEntity,
            MediaEntity,
            MediaExtEntity,
            MediaFileEntity,
            MediaFormatEntity,
            MediaTypeEntity,
            FileEntity,
            FileMetadataEntity,
            AudioFileMetadataEntity,
            VideoFileMetadataEntity,
            ImageFileMetadataEntity,
            ExifFileMetadataEntity,
            GpsFileMetadataEntity,
            IccFileMetadataEntity,
            ExplorerTargetEntity,
            ExplorerColumnEntity,
            ExplorerTabEntity,
            ExplorerColumnRendererEntity,
            ExplorerActionEntity,
            LanguageEntity,
            LocalizedStringEntity,
            LocalizedMediaEntity,
            CategoryEntity,
            WebAppMenuRestrictionEntity
          ],
          migrations: [],
          subscribers: [
            UserSubscriber
          ]
        };
        return opts;
      }
    };
  }

}