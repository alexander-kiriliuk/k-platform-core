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

import {
  TypeOrmModuleAsyncOptions,
  TypeOrmModuleOptions,
} from "@nestjs/typeorm";
import { LoggerOptions } from "typeorm";
import {
  AudioFileMetadataEntity,
  CacheModule,
  CacheService,
  CategoryEntity,
  CategoryRestrictionEntity,
  ExifFileMetadataEntity,
  ExplorerActionEntity,
  ExplorerColumnEntity,
  ExplorerColumnRendererEntity,
  ExplorerTabEntity,
  ExplorerTargetEntity,
  FileEntity,
  FileMetadataEntity,
  GpsFileMetadataEntity,
  IccFileMetadataEntity,
  ImageFileMetadataEntity,
  LanguageEntity,
  LocalizedMediaEntity,
  LocalizedStringEntity,
  MediaEntity,
  MediaExtEntity,
  MediaFileEntity,
  MediaFormatEntity,
  MediaTypeEntity,
  ProcessLogEntity,
  ProcessUnitEntity,
  UserEntity,
  UserRoleEntity,
  UserSubscriber,
  VideoFileMetadataEntity,
} from "@k-platform/core";
import { DbConfig } from "@gen-src/db.config";

export namespace Orm {
  export function getOptions(synchronize = false): TypeOrmModuleAsyncOptions {
    return {
      imports: [CacheModule],
      inject: [CacheService],
      useFactory: async (cs: CacheService) => {
        const opts: TypeOrmModuleOptions = {
          type: (await cs.get(DbConfig.TYPE)) as any,
          host: await cs.get(DbConfig.HOST),
          port: await cs.getNumber(DbConfig.PORT),
          synchronize:
            synchronize === true
              ? synchronize
              : await cs.getBoolean(DbConfig.SYNCHRONIZE),
          logging: (await cs.get(DbConfig.LOGGING)) as LoggerOptions,
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
            CategoryRestrictionEntity,
          ],
          migrations: [],
          subscribers: [UserSubscriber],
        };
        return opts;
      },
    };
  }
}
