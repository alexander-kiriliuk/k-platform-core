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
import { JwtDto, LoginPayload } from "@auth/src/auth.types";
import { User } from "@user/src/user.types";
import { MsClient } from "@shared/client-proxy/ms-client";
import { BRUTEFORCE, JWT, UNKNOWN_IP } from "@shared/constants";
import { JwtService } from "@nestjs/jwt";
import { v4 as uuidv4 } from "uuid";
import { RedisProxyService } from "@shared/modules/redis/redis-proxy.service";
import { TooManyRequestsMsException } from "@shared/exceptions/too-many-requests-ms.exception";

@Injectable()
export class AuthService {

  constructor(
    private readonly msClient: MsClient,
    private readonly redisService: RedisProxyService,
    private readonly jwtService: JwtService) {
  }

  async authenticate(data: LoginPayload): Promise<JwtDto> {
    if (!data.ipAddress?.length) {
      data.ipAddress = UNKNOWN_IP;
    }
    const isBlocked = await this.isBlocked(data.login, data.ipAddress);
    if (isBlocked) {
      throw new TooManyRequestsMsException();
    }
    const user = await this.validateUser(data);
    if (!user) {
      await this.registerFailedAttempt(data.login, data.ipAddress);
      return null;
    }
    await this.resetFailedAttempts(data.login, data.ipAddress);
    const accessToken = this.jwtService.sign({ login: user.login });
    await this.redisService.client.set(
      `${JWT.redisPrefix}:${JWT.accessTokenPrefix}:${accessToken}`,
      user.login,
      "EX",
      JWT.accessTokenExpiration,
    );
    const refreshToken = uuidv4();
    await this.redisService.client.set(
      `${JWT.redisPrefix}:${JWT.refreshTokenPrefix}:${accessToken}:${refreshToken}`,
      user.login,
      "EX",
      JWT.refreshTokenExpiration,
    );
    return { user, accessToken, refreshToken };
  }

  async invalidateToken(accessToken: string) {
    const userLogin = await this.redisService.client.get(
      `${JWT.redisPrefix}:${JWT.accessTokenPrefix}:${accessToken}`,
    );
    if (userLogin) {
      await this.redisService.client.del(`${JWT.redisPrefix}:${JWT.accessTokenPrefix}:${accessToken}`);
      const refreshTokenKeyPattern = `${JWT.redisPrefix}:${JWT.refreshTokenPrefix}:${accessToken}:*`;
      const refreshTokenKeys = await this.redisService.getFromPattern(refreshTokenKeyPattern);
      // delete all related refresh tokens
      if (refreshTokenKeys.length > 0) {
        await this.redisService.client.del(...refreshTokenKeys);
      }
    } else {
      return false;
    }
    return true;
  }

  async exchangeToken(refreshToken: string): Promise<Partial<JwtDto>> {
    const refreshTokenKeyPattern = `${JWT.redisPrefix}:${JWT.refreshTokenPrefix}:*:${refreshToken}`;
    const refreshTokenKeys = await this.redisService.getFromPattern(refreshTokenKeyPattern);
    if (refreshTokenKeys.length === 0) {
      return null;
    }
    const refreshTokenKey = refreshTokenKeys[0];
    const userLogin = await this.redisService.client.get(refreshTokenKey);
    if (!userLogin) {
      return null;
    }
    const accessToken = this.jwtService.sign({ login: userLogin });
    await this.redisService.client.set(
      `${JWT.redisPrefix}:${JWT.accessTokenPrefix}:${accessToken}`,
      userLogin,
      "EX",
      JWT.accessTokenExpiration,
    );
    const newRefreshToken = uuidv4();
    await this.redisService.client.set(
      `${JWT.redisPrefix}:${JWT.refreshTokenPrefix}:${accessToken}:${newRefreshToken}`,
      userLogin,
      "EX",
      JWT.refreshTokenExpiration,
    );
    // extract related access token for delete
    const oldAccessToken = this.extractAccessTokenFromRefreshTokenKey(refreshTokenKey);
    const oldAccessTokenKey = `${JWT.redisPrefix}:${JWT.accessTokenPrefix}:${oldAccessToken}`;
    await this.redisService.client.del(refreshTokenKey, oldAccessTokenKey);
    return { accessToken, refreshToken: newRefreshToken };
  }

  private async isBlocked(login: string, ipAddress: string): Promise<boolean> {
    if (!BRUTEFORCE.enabled) {
      return false;
    }
    const loginKey = `${BRUTEFORCE.redisPrefix}:login:${login}`;
    const ipKey = `${BRUTEFORCE.redisPrefix}:ip:${ipAddress}`;
    const [loginAttempts, ipAttempts] = await Promise.all([
      this.redisService.client.get(loginKey),
      this.redisService.client.get(ipKey),
    ]);
    return (loginAttempts && parseInt(loginAttempts, 10) >= BRUTEFORCE.maxAttempts) ||
      (ipAttempts && parseInt(ipAttempts, 10) >= BRUTEFORCE.maxAttempts);
  }

  private async registerFailedAttempt(login: string, ipAddress: string): Promise<void> {
    if (!BRUTEFORCE.enabled) {
      return;
    }
    const loginKey = `${BRUTEFORCE.redisPrefix}:login:${login}`;
    const ipKey = `${BRUTEFORCE.redisPrefix}:ip:${ipAddress}`;
    const [loginAttempts, ipAttempts] = await Promise.all([
      this.redisService.client.get(loginKey),
      this.redisService.client.get(ipKey),
    ]);
    if (loginAttempts) {
      await this.redisService.client.incr(loginKey);
    } else {
      await this.redisService.client.set(loginKey, 1, "EX", BRUTEFORCE.blockDuration);
    }
    if (ipAttempts) {
      await this.redisService.client.incr(ipKey);
    } else {
      await this.redisService.client.set(ipKey, 1, "EX", BRUTEFORCE.blockDuration);
    }
  }

  private async resetFailedAttempts(login: string, ipAddress: string): Promise<void> {
    if (!BRUTEFORCE.enabled) {
      return;
    }
    const loginKey = `${BRUTEFORCE.redisPrefix}:login:${login}`;
    const ipKey = `${BRUTEFORCE.redisPrefix}:ip:${ipAddress}`;
    await Promise.all([
      this.redisService.client.del(loginKey),
      this.redisService.client.del(ipKey),
    ]);
  }

  private async validateUser(payload: LoginPayload): Promise<User> {
    const user = await this.msClient.dispatch<User, string>("user.find.by.login", payload.login);
    if (!user) {
      return null;
    }
    const passwordValid = await bcrypt.compare(payload.password, user.password);
    if (user && passwordValid) {
      return user;
    }
    return null;
  }

  private extractAccessTokenFromRefreshTokenKey(refreshTokenKey: string) {
    const regex = new RegExp(`${JWT.redisPrefix}:${JWT.refreshTokenPrefix}:(.*):[^:]*$`);
    const parts = refreshTokenKey.match(regex);
    if (parts?.length) {
      return parts[1];
    }
    return null;
  }

}
