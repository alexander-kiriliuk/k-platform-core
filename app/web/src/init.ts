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

import { NestFactory } from "@nestjs/core";
import { ConfigModule } from "@config/config.module";
import { ConfigService } from "@config/config.service";
import { XmlDataBridgeModule } from "@xml-data-bridge/xml-data-bridge.module";
import { Xdb, XdbService } from "@xml-data-bridge/xml-data-bridge.constants";
import { FilesUtils } from "@shared/utils/files.utils";
import { LogModule } from "@shared/modules/log/log.module";
import { FileModule } from "@files/file.module";
import { MediaModule } from "@media/media.module";
import { XmlDataBridgeService } from "@xml-data-bridge/xml-data-bridge.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Orm } from "./orm.config";
import Redis from "ioredis";
import { EnvLoader } from "@shared/utils/env.loader";
import { DataSource } from "typeorm";
import { DbConfig } from "../gen-src/db.config";
import { CacheModule } from "@shared/modules/cache/cache.module";
import { CacheService } from "@shared/modules/cache/cache.types";
import { ExplorerModule } from "@explorer/explorer.module";
import readFile = FilesUtils.readFile;

(async () => {

  async function prepareEnvironment() {
    EnvLoader.loadEnvironment();
    const redisClient = new Redis({
      lazyConnect: true,
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT),
      db: parseInt(process.env.REDIS_DB),
      username: process.env.REDIS_USER,
      password: process.env.REDIS_PASSWORD
    });
    console.log(`Test redis connection...`);
    await new Promise((resolve, reject) => {
      redisClient.connect().then(value => resolve(value))
        .catch(reason => reject(reason));
    });
    redisClient.disconnect();
    console.log(`Redis connection successful`);
    console.log(`Try to init configuration`);
    await initConfig();

    console.log(`Test database connection...`);
    const app = await NestFactory.createApplicationContext(CacheModule);
    const cs = app.select(CacheModule).get(CacheService);
    const ds = new DataSource({
      type: await cs.get(DbConfig.TYPE) as any,
      host: await cs.get(DbConfig.HOST),
      port: await cs.getNumber(DbConfig.PORT),
      username: await cs.get(DbConfig.USERNAME),
      password: await cs.get(DbConfig.PASSWORD)
    });
    await ds.initialize();
    const dbName = await cs.get(DbConfig.DATABASE);
    console.log(`Database connection successful`);
    console.log(`Try to drop database ${dbName} if that not exists`);
    const queryRunner = ds.createQueryRunner();
    await queryRunner.dropDatabase(dbName, true);
    console.log(`Try to create database ${dbName}`);
    await queryRunner.createDatabase(dbName);
    console.log(`Try init database`);
    await initDatabase();
  }

  async function initConfig() {
    const app = await NestFactory.createApplicationContext(ConfigModule);
    await app.init();
    const service = app.select(ConfigModule).get(ConfigService);
    await service.initWithPropertiesFiles();
    await app.close();
  }

  async function initDatabase() {
    const mod = XmlDataBridgeModule.forRoot({
      service: XmlDataBridgeService,
      imports: [
        LogModule,
        CacheModule,
        FileModule.forRoot(),
        MediaModule.forRoot(),
        ExplorerModule.forRoot(),
        TypeOrmModule.forRootAsync(Orm.getOptions(true))
      ]
    });
    const app = await NestFactory.createApplicationContext(mod);
    await app.init();
    console.log(`Database was initialized`);
    const service = app.select(mod).get(XdbService);
    console.log(`Import initial-data`);
    const initialDataBody = await parseXmlFileData("/app/web/res/initial-data.xml");
    await service.importXml(initialDataBody);
    const sampleDataBody = await parseXmlFileData("/app/web/res/sample-data.xml");
    console.log(`Import sample-data`);
    await service.importXml(sampleDataBody);
    await app.close();
  }

  async function parseXmlFileData(filePath: string) {
    const xmlData = await readFile(`${process.cwd()}${filePath}`);
    return await Xdb.parseXmlFile(xmlData);
  }

  await prepareEnvironment();
  console.log(`Application has been initialized, now you can run that`);
  process.exit();

})();
