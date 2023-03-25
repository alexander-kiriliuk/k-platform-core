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
import { DbScriptEvaluatorModule } from "./db-script-evaluator.module";
import { TRANSPORT_OPTIONS, TRANSPORT_TYPE } from "@shared/constants";

(async () => {
  const app = await NestFactory.createMicroservice(
    DbScriptEvaluatorModule,
    {
      transport: TRANSPORT_TYPE,
      options: TRANSPORT_OPTIONS,
    });
  await app.listen();
})();
