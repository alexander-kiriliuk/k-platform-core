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

import { NestFactory, Reflector } from "@nestjs/core";
import { WebAppModule } from "./web-app.module";
import {
  ClassSerializerInterceptor,
  ForbiddenException,
  Logger,
  ValidationPipe,
} from "@nestjs/common";
import { ExpressAdapter } from "@nestjs/platform-express";
import { CorsOptions } from "@nestjs/common/interfaces/external/cors-options.interface";
import helmet from "helmet";
import * as express from "express";
import { json, NextFunction, Request, Response, urlencoded } from "express";
import * as cookieParser from "cookie-parser";
import {
  CacheModule,
  CacheService,
  DbExceptionFilter,
  EnvLoader,
  JsonUtils,
  LOGGER,
  LogModule,
} from "@k-platform/core";
import { CorsConfig } from "@gen-src/cors.config";
import { ServerConfig } from "@gen-src/server.config";

(async () => {
  const server = express();
  const expressAdapter = new ExpressAdapter(server);
  expressAdapter.disable("x-powered-by");
  expressAdapter.set("trust proxy", true);
  expressAdapter.set("json replacer", JsonUtils.jsonFilter);

  const app = await NestFactory.create(WebAppModule, expressAdapter);
  const logger: Logger = app.select(LogModule).get(LOGGER);
  EnvLoader.loadEnvironment(logger);
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalFilters(new DbExceptionFilter());
  const cacheService: CacheService = app.select(CacheModule).get(CacheService);
  const crossOriginResourcePolicy = await cacheService.get(
    CorsConfig.RESOURCE_POLICY,
  );
  const reqLimit = await cacheService.get(ServerConfig.REQ_LIMIT);
  expressAdapter.use(json({ limit: reqLimit }));
  expressAdapter.use(urlencoded({ extended: true, limit: reqLimit }));
  app.use(
    helmet({
      crossOriginResourcePolicy: {
        policy: crossOriginResourcePolicy as
          | "same-origin"
          | "same-site"
          | "cross-origin",
      },
    }),
  );
  const corsOptions: CorsOptions = {
    allowedHeaders: await cacheService.get(CorsConfig.HEADERS),
    methods: await cacheService.get(CorsConfig.METHODS),
    origin: (await cacheService.get(CorsConfig.ORIGIN))?.split(","),
    credentials: await cacheService.getBoolean(CorsConfig.CREDENTIALS),
  };
  app.enableCors(corsOptions);
  const result = await cacheService.get(ServerConfig.EXCLUDE_URLS);
  const excludeUrls = result.length ? result.split(" ") : [];
  if (excludeUrls.length) {
    app.use((req: Request, res: Response, next: NextFunction) => {
      for (const reContent of excludeUrls) {
        if (new RegExp(reContent, "g").test(req.url)) {
          throw new ForbiddenException();
        }
      }
      next();
    });
  }
  const apiPrefix = await cacheService.get(ServerConfig.PREFIX);
  const apiPort = await cacheService.getNumber(ServerConfig.PORT);
  app.setGlobalPrefix(apiPrefix);
  await app.listen(apiPort);
  logger.log(`Web-app listen port: ${apiPort}`);
})();
