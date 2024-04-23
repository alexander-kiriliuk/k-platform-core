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

import { DynamicModule, Module, OnModuleInit } from "@nestjs/common";
import { BasicExplorerService } from "./basic-explorer.service";
import { LogModule } from "@shared/modules/log/log.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ExplorerTargetEntity } from "./entity/explorer-target.entity";
import { ExplorerColumnEntity } from "./entity/explorer-column.entity";
import { ExplorerModuleOptions, ExplorerService } from "@explorer/explorer.types";

@Module({})
export class ExplorerModule implements OnModuleInit {

  static forRoot(options: ExplorerModuleOptions = {
    service: BasicExplorerService
  }): DynamicModule {
    return {
      module: ExplorerModule,
      imports: [
        TypeOrmModule.forFeature([
          ExplorerTargetEntity,
          ExplorerColumnEntity
        ]),
        LogModule
      ],
      providers: [
        {
          provide: ExplorerService,
          useClass: options.service
        }
      ],
      exports: [ExplorerService]
    };
  }

  constructor(
    private readonly service: ExplorerService) {
  }

  async onModuleInit() {
    await this.service.analyzeDatabase();
  }

}
