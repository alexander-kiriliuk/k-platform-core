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
import { AuthGuard } from "../../shared/guards/auth.guard";
import { RolesGuard } from "../../shared/guards/roles.guard";
import {
  BasicExplorerController,
  EntitySaveHandler,
  ExplorerService,
  ExplorerTarget,
  ExplorerTargetParams,
  TargetData,
} from "./explorer.types";
import { ForRoles } from "../../shared/decorators/for-roles.decorator";
import { Roles } from "../../shared/constants";
import { ObjectLiteral } from "typeorm";
import { CurrentUser } from "../../shared/decorators/current-user.decorator";
import { User } from "../user/user.types";
import {
  PageableData,
  PageableParams,
} from "../../shared/modules/pageable/pageable.types";
import ENTITY_SAVE_HANDLER = Explorer.ENTITY_SAVE_HANDLER;
import { Explorer } from "./explorer.constants";

@Controller("/explorer")
@UseGuards(AuthGuard, RolesGuard)
export class ExplorerController implements BasicExplorerController {
  constructor(
    @Optional()
    @Inject(ENTITY_SAVE_HANDLER)
    private readonly saveHandlers: EntitySaveHandler[] = [],
    private readonly explorerService: ExplorerService,
  ) {}

  @Get("/target-list")
  @ForRoles(Roles.ADMIN)
  async getTargetList(): Promise<ExplorerTarget[]> {
    return await this.explorerService.getTargetList();
  }

  @Post("/target")
  @ForRoles(Roles.ADMIN)
  async saveTarget(@Body() target: ExplorerTarget): Promise<ExplorerTarget> {
    return await this.explorerService.changeTarget(target);
  }

  @Get("/target/:target")
  async getTarget(
    @Param("target") target: string,
    @Query("type") type: "section" | "object",
    @CurrentUser() user: User,
  ): Promise<TargetData> {
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
  ): Promise<ObjectLiteral> {
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
  ): Promise<PageableData<any>> {
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
  ): Promise<T> {
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
  ): Promise<ObjectLiteral> {
    const targetParams: ExplorerTargetParams = {
      writeRequest: true,
      checkUserAccess: user,
    };
    return await this.explorerService.removeEntity(target, id, targetParams);
  }
}
