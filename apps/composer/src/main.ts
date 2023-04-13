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
import { ComposerModule } from "./composer.module";
import { Logger, ValidationPipe } from "@nestjs/common";
import { LogModule } from "@shared/modules/log/log.module";
import { EnvLoader } from "@shared/utils/env.loader";
import { LOGGER } from "@shared/modules/log/log.constants";
import helmet from "helmet";

(async () => {
  const app = await NestFactory.create(ComposerModule, { cors: false });
  const logger: Logger = app.select(LogModule).get(LOGGER);
  EnvLoader.loadEnvironment(logger);
  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({ transform: true }),
  );
  app.setGlobalPrefix(process.env.COMPOSER_API_PREFIX);
  await app.listen(parseInt(process.env.COMPOSER_API_PORT));
  logger.log(`Composer app listen port: ${process.env.COMPOSER_API_PORT}`);
})();
