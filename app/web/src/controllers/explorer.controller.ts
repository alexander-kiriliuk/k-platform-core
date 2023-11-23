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

import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@shared/guards/auth.guard";
import { PageableParams } from "@shared/modules/pageable/pageable.types";
import { ExplorerService, ExplorerTarget, ExplorerTargetParams } from "@explorer/explorer.types";

@Controller("/explorer")
export class ExplorerController {

  constructor(
    private readonly explorerService: ExplorerService) {
  }

  @UseGuards(AuthGuard)
  @Get("/target-list")
  async getTargetList() {
    return await this.explorerService.getTargetList();
  }

  @UseGuards(AuthGuard)
  @Post("/target")
  async saveTarget(@Body() target: ExplorerTarget) {
    return await this.explorerService.changeTarget(target);
  }

  @UseGuards(AuthGuard)
  @Get("/target/:target")
  async getTarget(@Param("target") target: string, @Query("type") type: "section" | "object") {
    const params: ExplorerTargetParams = {
      section: type === "section",
      object: type === "object",
      fullRelations: true
    };
    const res = await this.explorerService.getTargetData(target, params);
    if (!res) {
      throw new NotFoundException();
    }
    return res;
  }

  @UseGuards(AuthGuard)
  @Get("/entity/:target")
  async getEntity(@Param("target") target: string, @Query("id") id: string) {
    const res = await this.explorerService.getEntityData(target, id);
    if (!res) {
      throw new NotFoundException();
    }
    return res;
  }

  @UseGuards(AuthGuard)
  @Get("/pageable/:target")
  async getEntityList(@Param("target") target: string, @Query() params: PageableParams) {
    return await this.explorerService.getPageableEntityData(target, params);
  }

  @UseGuards(AuthGuard)
  @Post("/entity/:target")
  async saveEntity<T>(@Param("target") target: string, @Body() data: T) {
    return await this.explorerService.saveEntityData(target, data);
  }

  @UseGuards(AuthGuard)
  @Delete("/entity/:target/:id")
  async removeEntity(@Param("target") target: string, @Param("id") id: string) {
    return await this.explorerService.removeEntity(target, id);
  }

}
