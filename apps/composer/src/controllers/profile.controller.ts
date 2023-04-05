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
import { User, UserDto, UserUpdateRequest } from "@user/src/user.types";
import { ResponseDto } from "@shared/decorators/dto.decorator";
import { MsClient } from "@shared/modules/ms-client/ms-client";


@Controller("/profile")
export class ProfileController {

  constructor(
    private readonly msClient: MsClient) {
  }

  @ResponseDto(UserDto)
  @UseGuards(AuthGuard)
  @Get("/:id")
  async getUserProfile(@Param("id") id: string, @CurrentUser() user: User) {
    return await this.msClient.dispatch<User, string>("user.find.by.id", id);
  }

  @ResponseDto(UserDto)
  @UseGuards(AuthGuard)
  @Patch("/:id")
  async updateUserProfile(@Param("id") id: string, @Body() profile: User) {
    return await this.msClient.dispatch<User, UserUpdateRequest>("user.update", {
      user: profile, id,
    });
  }

  @ResponseDto(UserDto)
  @UseGuards(AuthGuard)
  @Delete("/:id")
  async removeUserProfile(@Param("id") id: string) {
    return await this.msClient.dispatch<User, string>("user.remove.by.id", id);
  }

  @ResponseDto(UserDto)
  @UseGuards(AuthGuard)
  @Post("/")
  async createUserProfile(@Body() profile: User) {
    return await this.msClient.dispatch<User, User>("user.create", profile);
  }

  @ResponseDto(UserDto)
  @UseGuards(AuthGuard)
  @Get("/")
  async getCurrentUserProfile(@CurrentUser() user: User) {
    return user;
  }

}
