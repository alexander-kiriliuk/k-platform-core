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

import { MessagePattern } from "@nestjs/microservices";
import { Controller } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { JwtService } from "@nestjs/jwt";
import { JwtDto, LoginPayload } from "@auth/src/auth.types";
import { JWT } from "@shared/constants";
import { RedisService } from "@liaoliaots/nestjs-redis";

@Controller()
export class AuthController {

  constructor(
    private readonly redisService: RedisService,
    private readonly authService: AuthService,
    private readonly jwtService: JwtService) {
  }

  private get redisClient() {
    return this.redisService.getClient();
  }

  @MessagePattern("auth.login")
  async login(data: LoginPayload): Promise<JwtDto> {
    const user = await this.authService.validateUser(data);
    if (!user) {
      return null;
    }
    const accessToken = this.jwtService.sign({ login: user.login });
    await this.redisClient.set(
      `${JWT.redisPrefix}:${JWT.redisTokenPrefix}:${accessToken}`,
      user.login,
      "EX",
      JWT.accessTokenExpiration,
    );
    return { user, accessToken };
  }

}
