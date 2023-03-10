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

import { Test, TestingModule } from "@nestjs/testing";
import { DbAnalyzerController } from "./db-analyzer.controller";
import { DbAnalyzerService } from "./db-analyzer.service";

describe("DbAnalyzerController", () => {
  let dbAnalyzerController: DbAnalyzerController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [DbAnalyzerController],
      providers: [DbAnalyzerService],
    }).compile();

    dbAnalyzerController = app.get<DbAnalyzerController>(DbAnalyzerController);
  });

  describe("root", () => {
    it("should return \"Hello World!\"", () => {
      expect(dbAnalyzerController.getHello()).toBe("Hello World!");
    });
  });
});
