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

import * as fs from "fs";
import { config } from "dotenv";
import { Logger } from "@nestjs/common";

export namespace EnvLoader {
  export function loadEnvironment(logger?: Logger) {
    let envFile = `${process.cwd()}/${process.env.NODE_ENV || "local"}.env`;
    const msg = `Try to load .env file ${envFile}`;
    logger ? logger.verbose(msg) : console.log(msg);
    if (fs.existsSync(envFile)) {
      config({ path: envFile });
    } else {
      const msg = `File ${envFile} not exists, skip and load default.env`;
      logger ? logger.warn(msg) : console.warn(msg);
      envFile = `${process.cwd()}/default.env`;
      config({ path: envFile });
    }
    const resMsg = `.env file ${envFile} was loaded`;
    logger ? logger.verbose(resMsg) : console.log(resMsg);
  }
}
