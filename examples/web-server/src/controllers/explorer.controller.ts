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

import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  NotFoundException,
  Optional,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  AuthGuard,
  CurrentUser,
  EntitySaveHandler,
  Explorer,
  ExplorerService,
  ExplorerTarget,
  ExplorerTargetParams,
  ForRoles,
  PageableParams,
  Roles,
  RolesGuard,
  User,
} from "@k-platform/core";
import ENTITY_SAVE_HANDLER = Explorer.ENTITY_SAVE_HANDLER;

@Controller("/explorer")
@UseGuards(AuthGuard, RolesGuard)
export class ExplorerController {
  constructor(
    @Optional()
    @Inject(ENTITY_SAVE_HANDLER)
    private readonly saveHandlers: EntitySaveHandler[] = [],
    private readonly explorerService: ExplorerService,
  ) {}

  @Get("/target-list")
  @ForRoles(Roles.ADMIN)
  async getTargetList() {
    return await this.explorerService.getTargetList();
  }

  @Post("/target")
  @ForRoles(Roles.ADMIN)
  async saveTarget(@Body() target: ExplorerTarget) {
    return await this.explorerService.changeTarget(target);
  }

  @Get("/target/:target")
  async getTarget(
    @Param("target") target: string,
    @Query("type") type: "section" | "object",
    @CurrentUser() user: User,
  ) {
    const targetParams: ExplorerTargetParams = {
      section: type === "section",
      object: type === "object",
      fullRelations: true,
      readRequest: true,
      checkUserAccess: user,
    };
    const res = await this.explorerService.getTargetData(target, targetParams);
    if (!res) {
      throw new NotFoundException();
    }
    return res;
  }

  @Get("/entity/:target")
  async getEntity(
    @Param("target") target: string,
    @Query("id") id: string,
    @CurrentUser() user: User,
  ) {
    const targetParams: ExplorerTargetParams = {
      readRequest: true,
      checkUserAccess: user,
    };
    const res = await this.explorerService.getEntityData(
      target,
      id,
      undefined,
      targetParams,
    );
    if (!res) {
      throw new NotFoundException();
    }
    return res;
  }

  @Get("/pageable/:target")
  async getEntityList(
    @Param("target") target: string,
    @Query() params: PageableParams,
    @CurrentUser() user: User,
  ) {
    const targetParams: ExplorerTargetParams = {
      readRequest: true,
      checkUserAccess: user,
    };
    return await this.explorerService.getPageableEntityData(
      target,
      params,
      targetParams,
    );
  }

  @Post("/entity/:target")
  async saveEntity<T>(
    @Param("target") target: string,
    @Body() body: T,
    @CurrentUser() user: User,
  ) {
    let data = body;
    for (const handler of this.saveHandlers) {
      data = handler.handle(target, data, user);
    }
    const targetParams: ExplorerTargetParams = {
      writeRequest: true,
      checkUserAccess: user,
    };
    return await this.explorerService.saveEntityData(
      target,
      data,
      targetParams,
    );
  }

  @Delete("/entity/:target")
  async removeEntity(
    @Param("target") target: string,
    @Query("id") id: string,
    @CurrentUser() user: User,
  ) {
    const targetParams: ExplorerTargetParams = {
      writeRequest: true,
      checkUserAccess: user,
    };
    return await this.explorerService.removeEntity(target, id, targetParams);
  }
}
