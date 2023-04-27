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
import { FileModule } from "./file.module";
import { EnvLoader } from "@shared/utils/env.loader";

EnvLoader.loadEnvironment();

(async () => {
  const app = await NestFactory.createMicroservice(
    FileModule,
    {
      transport: parseInt(process.env.TRANSPORT_TYPE),
      options: {
        host: process.env.TRANSPORT_HOST,
        port: parseInt(process.env.TRANSPORT_PORT),
        timeout: parseInt(process.env.TRANSPORT_TIMEOUT)
      }
    });
  await app.listen();
})();
