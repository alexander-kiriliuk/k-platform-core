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

import { Inject, Injectable, Logger } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { JwtDto, LoginPayload } from "@auth/src/auth.types";
import { User } from "@user/src/user.types";
import { MsClient } from "@shared/modules/ms-client/ms-client";
import { JwtService } from "@nestjs/jwt";
import { v4 as uuidv4 } from "uuid";
import { TooManyRequestsMsException } from "@shared/exceptions/too-many-requests-ms.exception";
import {
  bruteForceIPKey,
  bruteForceLoginKey,
  jwtAccessTokenKey,
  jwtRefreshTokenKey,
  UNKNOWN_IP,
} from "@auth/src/auth.constants";
import { CacheService } from "@shared/modules/cache/cache.types";
import { CACHE_SERVICE } from "@shared/modules/cache/cache.constants";
import { InvalidTokenMsException } from "@shared/exceptions/invalid-token-ms.exception";
import { LOGGER } from "@shared/modules/log/log.constants";
import { AuthConfig } from "@auth/gen-src/auth.config";
import { BruteforceConfig } from "@auth/gen-src/bruteforce.config";

@Injectable()
export class AuthService {

  constructor(
    @Inject(LOGGER) private readonly logger: Logger,
    @Inject(CACHE_SERVICE) private readonly cacheService: CacheService,
    private readonly msClient: MsClient,
    private readonly jwtService: JwtService) {
  }

  async authenticate(data: LoginPayload): Promise<JwtDto> {
    if (!data.ipAddress?.length) {
      data.ipAddress = UNKNOWN_IP;
    }
    const isBlocked = await this.isBlocked(data.login, data.ipAddress);
    if (isBlocked) {
      this.logger.warn(`Too many login attempts for ${data.login} from ${data.ipAddress}`);
      throw new TooManyRequestsMsException();
    }
    const user = await this.validateUser(data);
    if (!user) {
      this.logger.debug(`Invalid credentials for user ${data.login}`);
      await this.registerFailedAttempt(data.login, data.ipAddress);
      return null;
    }
    await this.resetFailedAttempts(data.login, data.ipAddress);
    const accessToken = this.jwtService.sign({ login: user.login });
    await this.cacheService.set(jwtAccessTokenKey(accessToken), user.login, AuthConfig.ACCESS_TOKEN_EXPIRATION);
    const refreshToken = uuidv4();
    await this.cacheService.set(jwtRefreshTokenKey(accessToken, refreshToken), user.login, AuthConfig.REFRESH_TOKEN_EXPIRATION);
    return { user, accessToken, refreshToken };
  }

  async invalidateToken(accessToken: string) {
    const userLogin = await this.cacheService.get(jwtAccessTokenKey(accessToken));
    if (userLogin) {
      this.logger.debug(`Invalidating access token for user ${userLogin}`);
      await this.deleteAccessToken(accessToken);
      await this.deleteRefreshTokens(accessToken, jwtRefreshTokenKey(accessToken, "*"));
    } else {
      this.logger.warn(`Attempt to invalidate an invalid token: ${accessToken}`);
      throw new InvalidTokenMsException();
    }
    return true;
  }

  async exchangeToken(refreshToken: string): Promise<Partial<JwtDto>> {
    const refreshTokenKeyPattern = jwtRefreshTokenKey("*", refreshToken);
    const refreshTokenKeys = await this.cacheService.getFromPattern(refreshTokenKeyPattern);
    if (refreshTokenKeys.length === 0) {
      this.logger.warn(`Attempt to exchange an invalid refresh token: ${refreshToken}`);
      return null;
    }
    const refreshTokenKey = refreshTokenKeys[0];
    const userLogin = await this.cacheService.get(refreshTokenKey);
    if (!userLogin) {
      return null;
    }
    const accessToken = this.jwtService.sign({ login: userLogin });
    await this.cacheService.set(jwtAccessTokenKey(accessToken), userLogin, AuthConfig.ACCESS_TOKEN_EXPIRATION);
    const newRefreshToken = uuidv4();
    await this.cacheService.set(
      `${AuthConfig.JWT_CACHE_PREFIX}:${AuthConfig.REFRESH_TOKEN_PREFIX}:${accessToken}:${newRefreshToken}`,
      userLogin,
      AuthConfig.REFRESH_TOKEN_EXPIRATION,
    );
    // extract related access token for delete
    const oldAccessToken = this.extractAccessTokenFromRefreshTokenKey(refreshTokenKey);
    await this.deleteAccessToken(oldAccessToken);
    await this.deleteRefreshTokens(oldAccessToken, refreshTokenKey);
    return { accessToken, refreshToken: newRefreshToken };
  }

  private async isBlocked(login: string, ipAddress: string): Promise<boolean> {
    if (!BruteforceConfig.ENABLED) {
      return false;
    }
    const loginKey = bruteForceLoginKey(login);
    const ipKey = bruteForceIPKey(ipAddress);
    const [loginAttempts, ipAttempts] = await Promise.all([
      this.cacheService.get(loginKey),
      this.cacheService.get(ipKey),
    ]);
    return (loginAttempts && parseInt(loginAttempts, 10) >= BruteforceConfig.MAX_ATTEMPTS) ||
      (ipAttempts && parseInt(ipAttempts, 10) >= BruteforceConfig.MAX_ATTEMPTS);
  }

  private async registerFailedAttempt(login: string, ipAddress: string): Promise<void> {
    if (!BruteforceConfig.ENABLED) {
      return;
    }
    this.logger.debug(`Registering failed login attempt for ${login} from ${ipAddress}`);
    const loginKey = bruteForceLoginKey(login);
    const ipKey = bruteForceIPKey(ipAddress);
    const [loginAttempts, ipAttempts] = await Promise.all([
      this.cacheService.get(loginKey),
      this.cacheService.get(ipKey),
    ]);
    const loginUpdate = loginAttempts
      ? this.cacheService.incr(loginKey)
      : this.cacheService.set(loginKey, 1, BruteforceConfig.BLOCK_DURATION);
    const ipUpdate = ipAttempts
      ? this.cacheService.incr(ipKey)
      : this.cacheService.set(ipKey, 1, BruteforceConfig.BLOCK_DURATION);
    await Promise.all([loginUpdate, ipUpdate]);
  }

  private async resetFailedAttempts(login: string, ipAddress: string): Promise<void> {
    if (!BruteforceConfig.ENABLED) {
      return;
    }
    this.logger.debug(`Resetting failed login attempts for ${login} from ${ipAddress}`);
    const loginKey = bruteForceLoginKey(login);
    const ipKey = bruteForceIPKey(ipAddress);
    await this.cacheService.del(loginKey, ipKey);
  }

  private async validateUser(payload: LoginPayload): Promise<User> {
    const user = await this.msClient.dispatch<User, string>("user.find.by.login", payload.login);
    if (!user) {
      this.logger.debug(`User not found: ${payload.login}`);
      return null;
    }
    const passwordValid = await bcrypt.compare(payload.password, user.password);
    if (user && passwordValid) {
      return user;
    }
    return null;
  }

  private extractAccessTokenFromRefreshTokenKey(refreshTokenKey: string) {
    const regex = new RegExp(`${AuthConfig.JWT_CACHE_PREFIX}:${AuthConfig.REFRESH_TOKEN_EXPIRATION}:(.*):[^:]*$`);
    const parts = refreshTokenKey.match(regex);
    if (parts?.length) {
      return parts[1];
    }
    return null;
  }

  private async deleteAccessToken(accessToken: string): Promise<void> {
    this.logger.debug(`Deleting access token: ${accessToken}`);
    await this.cacheService.del(jwtAccessTokenKey(accessToken));
  }

  private async deleteRefreshTokens(accessToken: string, pattern: string): Promise<void> {
    this.logger.debug(`Deleting refresh tokens for access token: ${accessToken}`);
    const refreshTokenKeys = await this.cacheService.getFromPattern(pattern);
    if (refreshTokenKeys.length > 0) {
      await this.cacheService.del(...refreshTokenKeys);
    }
  }

}
