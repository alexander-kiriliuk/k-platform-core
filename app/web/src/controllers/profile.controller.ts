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

import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@shared/guards/auth.guard";
import { CurrentUser } from "@shared/decorators/current-user.decorator";
import { User, UserDto } from "@user/user.types";
import { ResponseDto } from "@shared/decorators/response-dto.decorator";
import { RolesGuard } from "@shared/guards/roles.guard";
import { UserService } from "@user/user.service";


@Controller("/profile")
@UseGuards(AuthGuard, RolesGuard)
export class ProfileController {

  constructor(
    private readonly userService: UserService) {
  }

  @ResponseDto(UserDto)
  @Get("/:id")
  async getUserProfile(@Param("id") id: string) {
    return await this.userService.findById(id);
  }

  @ResponseDto(UserDto)
  @Patch("/:id")
  async updateUserProfile(@Param("id") id: string, @Body() profile: User) {
    return await this.userService.updateById(id, profile);
  }

  @ResponseDto(UserDto)
  @Delete("/:id")
  async removeUserProfile(@Param("id") id: string) {
    return await this.userService.removeById(id);
  }

  @ResponseDto(UserDto)
  @Post("/")
  async createUserProfile(@Body() profile: User) {
    return await this.userService.create(profile);
  }

  @ResponseDto(UserDto)
  @Get("/")
  async getCurrentUserProfile(@CurrentUser() user: User) {
    return user;
  }

}
