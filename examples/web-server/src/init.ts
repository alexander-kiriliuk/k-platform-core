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
import { Orm } from "./orm.config";
import Redis from "ioredis";
import { DataSource } from "typeorm";
import {
  CacheModule,
  CacheService,
  EnvLoader,
  ExplorerModule,
  FileModule,
  FilesUtils,
  LogModule,
  MediaModule,
  Xdb,
  XdbImportService,
  XmlDataBridgeExportService,
  XmlDataBridgeImportService,
  XmlDataBridgeModule,
} from "@k-platform/core";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DbConfig } from "@gen-src/db.config";
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
      password: process.env.REDIS_PASSWORD,
    });
    console.log("Test redis connection...");
    await new Promise((resolve, reject) => {
      redisClient
        .connect()
        .then((value) => resolve(value))
        .catch((reason) => reject(reason));
    });
    redisClient.disconnect();
    console.log("Redis connection successful");
    console.log("Try to init configuration");

    console.log("Test database connection...");
    const app = await NestFactory.createApplicationContext(CacheModule);
    const cs = app.select(CacheModule).get(CacheService);
    const ds = new DataSource({
      type: (await cs.get(DbConfig.TYPE)) as any,
      host: await cs.get(DbConfig.HOST),
      port: await cs.getNumber(DbConfig.PORT),
      username: await cs.get(DbConfig.USERNAME),
      password: await cs.get(DbConfig.PASSWORD),
    });
    await ds.initialize();
    const dbName = await cs.get(DbConfig.DATABASE);
    console.log("Database connection successful");
    console.log(`Try to drop database ${dbName} if that exists`);
    const queryRunner = ds.createQueryRunner();
    await queryRunner.dropDatabase(dbName, true);
    console.log(`Try to create database ${dbName}`);
    await queryRunner.createDatabase(dbName);
    console.log("Try init database");
    await initDatabase();
  }

  async function initDatabase() {
    const mod = XmlDataBridgeModule.forRoot({
      importService: XmlDataBridgeImportService,
      exportService: XmlDataBridgeExportService,
      imports: [
        LogModule,
        CacheModule,
        FileModule.forRoot(),
        MediaModule.forRoot(),
        ExplorerModule.forRoot(),
        TypeOrmModule.forRootAsync(Orm.getOptions(true)),
      ],
    });
    const app = await NestFactory.createApplicationContext(mod);
    await app.init();
    console.log("Database was initialized");
    const service = app.select(mod).get(XdbImportService);
    console.log("Import initial-data");
    const initialDataBody = await parseXmlFileData(
      "/app/web/res/initial-data.xml",
    );
    await service.importXml(initialDataBody);
    const sampleDataBody = await parseXmlFileData(
      "/app/web/res/sample-data.xml",
    );
    console.log("Import sample-data");
    await service.importXml(sampleDataBody);
    await app.close();
  }

  async function parseXmlFileData(filePath: string) {
    const xmlData = await readFile(`${process.cwd()}${filePath}`);
    return await Xdb.parseXmlFile(xmlData);
  }

  await prepareEnvironment();
  console.log("Application has been initialized, now you can run that");
  process.exit(0);
})();
