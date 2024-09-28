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
import { TypeOrmModule } from "@nestjs/typeorm";
import { ExplorerTargetEntity } from "./entity/explorer-target.entity";
import { ExplorerColumnEntity } from "./entity/explorer-column.entity";
import { ExplorerModuleOptions, ExplorerService } from "./explorer.types";
import { LogModule } from "../../shared/modules/log/log.module";
import { UserModule } from "../user/user.module";
import { CacheModule } from "../../shared/modules/cache/cache.module";
import { Explorer } from "./explorer.constants";
import { Provider } from "@nestjs/common/interfaces/modules/provider.interface";
import { Type } from "@nestjs/common/interfaces/type.interface";

/**
 * Module for exploring and analyzing the database schema and relationships.
 */
@Module({})
export class ExplorerModule implements OnModuleInit {
  static forRoot(
    options: Partial<ExplorerModuleOptions> = {
      service: BasicExplorerService,
      saveHandlers: [],
    },
  ): DynamicModule {
    if (!options.service) {
      options.service = BasicExplorerService;
    }

    const providers: Provider[] = [
      {
        provide: ExplorerService,
        useClass: options.service,
      },
    ];
    if (options.saveHandlers.length) {
      const providerWithHandlers = Explorer.provideSaveHandlers(
        options.saveHandlers,
      );
      options.saveHandlers.forEach((h) => {
        providers.push(h as Type);
      });
      providers.push(providerWithHandlers);
    }
    return {
      module: ExplorerModule,
      imports: [
        TypeOrmModule.forFeature([ExplorerTargetEntity, ExplorerColumnEntity]),
        LogModule,
        UserModule.forRoot(),
        CacheModule,
      ],
      providers: providers,
      exports: [ExplorerService],
    };
  }

  constructor(private readonly service: ExplorerService) {}

  /**
   * Initializes the module and analyzes the database.
   */
  async onModuleInit() {
    await this.service.analyzeDatabase();
  }
}
