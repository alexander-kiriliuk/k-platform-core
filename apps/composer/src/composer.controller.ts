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

import { BadRequestException, Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ComposerClient } from "@shared/client-proxy/composer.client";
import { JwtDto, LoginPayload } from "@auth/src/auth.types";
import { RedisAuthGuard } from "@shared/guarg/redis-auth.guard";

@Controller()
export class ComposerController {

  constructor(
    private client: ComposerClient) {
  }

  @Post("/auth/login")
  async login(@Body() payload: LoginPayload) {
    const dto = await this.client.dispatch<JwtDto, LoginPayload>("auth.login", payload);
    if (!dto) {
      throw new BadRequestException();
    }
    return dto;
  }

  @UseGuards(RedisAuthGuard)
  @Get("/profile")
  async profile() {
    // todo return current user profile
    return { ok: 200 };
  }

}
