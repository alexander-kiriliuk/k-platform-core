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
import { WebAppModule } from "./web-app.module";
import { Logger, ValidationPipe } from "@nestjs/common";
import { LogModule } from "@shared/modules/log/log.module";
import { EnvLoader } from "@shared/utils/env.loader";
import { LOGGER } from "@shared/modules/log/log.constants";
import { ExpressAdapter } from "@nestjs/platform-express";
import * as express from "express";
import helmet from "helmet";
import { JsonUtils } from "@shared/utils/json.utils";
import { CacheModule } from "@shared/modules/cache/cache.module";
import { CacheService } from "@shared/modules/cache/cache.types";
import { CorsConfig } from "../gen-src/cors.config";
import { CorsOptions } from "@nestjs/common/interfaces/external/cors-options.interface";
import { ServerConfig } from "../gen-src/server.config";

(async () => {
  const server = express();
  const expressAdapter = new ExpressAdapter(server);
  expressAdapter.disable("x-powered-by");
  expressAdapter.set("trust proxy", true);
  expressAdapter.set("json replacer", JsonUtils.jsonFilter);

  const app = await NestFactory.create(WebAppModule, expressAdapter);
  const cacheService: CacheService = app.select(CacheModule).get(CacheService);

  const corsOptions: CorsOptions = {
    allowedHeaders: await cacheService.get(CorsConfig.HEADERS),
    methods: await cacheService.get(CorsConfig.METHODS),
    origin: (await cacheService.get(CorsConfig.ORIGIN))?.split(","),
    credentials: await cacheService.getBoolean(CorsConfig.CREDENTIALS)
  };
  app.enableCors(corsOptions);

  const logger: Logger = app.select(LogModule).get(LOGGER);
  EnvLoader.loadEnvironment(logger);
  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({ transform: true })
  );
  const apiPrefix = await cacheService.get(ServerConfig.PREFIX);
  const apiPort = await cacheService.getNumber(ServerConfig.PORT);
  app.setGlobalPrefix(apiPrefix);
  await app.listen(apiPort);
  logger.log(`Web-app listen port: ${apiPort}`);
})();
