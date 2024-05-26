/*
 * Copyright 2023 Alexander Kiriliuk
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  AuthGuard,
  CurrentUser,
  ForRoles,
  ResponseDto,
  Roles,
  RolesGuard,
  User,
  UserDto,
  UserService,
  UserUtils,
} from "@k-platform/core";
import hasSomeRole = UserUtils.hasSomeRole;

@Controller("/profile")
@UseGuards(AuthGuard, RolesGuard)
export class ProfileController {
  constructor(private readonly userService: UserService) {}

  @ResponseDto(UserDto)
  @Get("/:id?")
  async getUserProfile(@Param("id") id: string, @CurrentUser() user: User) {
    if (!id) {
      return user;
    }
    if (!hasSomeRole(user.roles, Roles.ADMIN, Roles.MANAGER)) {
      throw new ForbiddenException();
    }
    const data = await this.userService.findById(id);
    if (!data) {
      throw new NotFoundException();
    }
    return data;
  }

  @ResponseDto(UserDto)
  @Patch("/:id?")
  async updateUserProfile(
    @Param("id") id: string,
    @Body() profile: User,
    @CurrentUser() user: User,
  ) {
    if (id && !hasSomeRole(user.roles, Roles.ADMIN)) {
      throw new ForbiddenException();
    }
    return await this.userService.updateById(id ?? user.id, profile);
  }

  @ResponseDto(UserDto)
  @Delete("/:id")
  @ForRoles(Roles.ADMIN)
  async removeUserProfile(@Param("id") id: string) {
    return await this.userService.removeById(id);
  }

  @ResponseDto(UserDto)
  @Post("/")
  @ForRoles(Roles.ADMIN, Roles.MANAGER)
  async createUserProfile(@Body() profile: User) {
    return await this.userService.create(profile);
  }
}
