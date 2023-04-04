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

import { Controller, Delete, Get, Post, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@shared/guards/auth.guard";
import { MsClient } from "@shared/modules/ms-client/ms-client";
import { EntityData, ExplorerEntityRequest, ExplorerPagedEntityRequest } from "@explorer/src/explorer.types";
import { PageableParams } from "@shared/modules/pageable/pageable.types";

@Controller("/explorer")
export class ExplorerController {

  constructor(
    private readonly msClient: MsClient) {
  }

  @UseGuards(AuthGuard)
  @Get("/pageable")
  async list(@Query("target") target: string, @Query() params: PageableParams) {
    return await this.msClient.dispatch<EntityData, ExplorerPagedEntityRequest>("explorer.entity.pageable", {
      target, params,
    });
  }

  @UseGuards(AuthGuard)
  @Get("/entity")
  async getEntity(@Query("target") target: string, @Query("id") id: string) {
    return await this.msClient.dispatch<EntityData, ExplorerEntityRequest>("explorer.entity.get", {
      id, target,
    });
  }

  @UseGuards(AuthGuard)
  @Post("/entity")
  async saveEntity() {
    // todo
  }

  @UseGuards(AuthGuard)
  @Delete("/entity")
  async removeEntity() {
    // todo
  }

}
