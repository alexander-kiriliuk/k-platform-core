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

import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { LoginPayload } from "@auth/src/auth.types";
import { User } from "@user/src/user.types";
import { MsClient } from "@shared/client-proxy/ms-client";
import { JWT } from "@shared/constants";
import { RedisService } from "@liaoliaots/nestjs-redis";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {

  constructor(
    private readonly client: MsClient,
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService) {
  }

  private get redisClient() {
    return this.redisService.getClient();
  }

  async authenticate(data: LoginPayload) {
    const user = await this.validateUser(data);
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

  private async validateUser(payload: LoginPayload): Promise<User> {
    const user = await this.client.dispatch("user.find.by.login", payload.login);
    if (!user) {
      return null;
    }
    const passwordValid = await bcrypt.compare(payload.password, user.password);
    if (user && passwordValid) {
      const { password, ...result } = user;
      return result as User;
    }
    return null;
  }

}
