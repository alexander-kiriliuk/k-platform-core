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
import { API } from "@shared/constants";
import { ValidationPipe } from "@nestjs/common";
import helmet from "helmet";

(async () => {
  const app = await NestFactory.create(ComposerModule, { cors: false });
  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({ transform: true }),
  );
  app.setGlobalPrefix(API.prefix);
  await app.listen(API.port);
})();
