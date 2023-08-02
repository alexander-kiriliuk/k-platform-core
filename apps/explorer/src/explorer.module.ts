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

import { Module, OnModuleInit } from "@nestjs/common";
import { ExplorerController } from "./explorer.controller";
import { ExplorerService } from "./explorer.service";
import { LogModule } from "@shared/modules/log/log.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ExplorerTargetEntity } from "@explorer/src/entity/explorer-target.entity";
import { ExplorerColumnEntity } from "@explorer/src/entity/explorer-column.entity";
import { LocaleModule } from "@locale/src/locale.module";
import { DbModule } from "@shared/modules/db/db.module";

@Module({
  imports: [
    LogModule,
    DbModule.forRoot(),
    TypeOrmModule.forFeature([
      ExplorerTargetEntity,
      ExplorerColumnEntity,
    ]),
    LocaleModule,
  ],
  controllers: [ExplorerController],
  providers: [ExplorerService],
})
export class ExplorerModule implements OnModuleInit {

  constructor(
    private readonly service: ExplorerService) {
  }

  async onModuleInit() {
    await this.service.analyzeDatabase();
  }

}
