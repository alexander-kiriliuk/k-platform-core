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
import { ConfigModule } from "./config.module";
import { Logger } from "@nestjs/common";
import { LogModule } from "../../shared/modules/log/log.module";
import { LOGGER } from "../../shared/modules/log/log.constants";
import { EnvLoader } from "../../shared/utils/env.loader";
import { ConfigService } from "./config.service";

/**
 * Asynchronously initializes the application context with the ConfigModule,
 * loads environment variables, and initializes the configuration service with .properties files.
 * This function used for initialize config store
 */
export const InitConfig = async () => {
  const mod = ConfigModule.forInitializer();
  const app = await NestFactory.createApplicationContext(mod);
  await app.init();
  const logger: Logger = app.select(LogModule).get(LOGGER);
  EnvLoader.loadEnvironment(logger);
  const configService = app.select(mod).get(ConfigService);
  const genCnfDir = `${process.cwd()}/${process.env.CONFIG_SRC_DIR}`;
  await configService.initWithPropertiesFiles(genCnfDir);
  await app.close();
  process.exit(0);
};
