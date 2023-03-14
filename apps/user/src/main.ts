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
import { UserModule } from "./user.module";
import { PG_DATA_SOURCE, TRANSPORT_OPTIONS, TRANSPORT_TYPE } from "@shared/constants";

async function bootstrap() {
  const app = await NestFactory.createMicroservice(
    UserModule,
    {
      transport: TRANSPORT_TYPE,
      options: TRANSPORT_OPTIONS,
    });
  await PG_DATA_SOURCE.initialize();
  await app.listen();
}

bootstrap();
