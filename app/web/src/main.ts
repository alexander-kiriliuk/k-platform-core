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

(async () => {
  const server = express();
  const expressAdapter = new ExpressAdapter(server);
  expressAdapter.disable("x-powered-by");
  expressAdapter.set("trust proxy", true);
  expressAdapter.set("json replacer", JsonUtils.jsonFilter);

  const app = await NestFactory.create(WebAppModule, expressAdapter, { cors: false });
  const logger: Logger = app.select(LogModule).get(LOGGER);
  EnvLoader.loadEnvironment(logger);
  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({ transform: true })
  );
  app.setGlobalPrefix(process.env.WEB_APP_API_PREFIX);
  await app.listen(parseInt(process.env.WEB_APP_API_PORT));
  logger.log(`Composer app listen port: ${process.env.WEB_APP_API_PORT}`);
})();
