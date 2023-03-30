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

import { Controller, Get, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@shared/guards/auth.guard";
import { CurrentUser } from "@shared/decorators/current-user.decorator";
import { User, UserDto } from "@user/src/user.types";
import { ResponseDto } from "@shared/decorators/dto.decorator";

@Controller("/profile")
export class ProfileController {

  @ResponseDto(UserDto)
  @UseGuards(AuthGuard)
  @Get("/current")
  async profile(@CurrentUser() user: User) {
    return user;
  }

}
