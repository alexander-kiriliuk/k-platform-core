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
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { JwtDto, LoginPayload } from "./auth.types";
import { JwtService } from "@nestjs/jwt";
import { v4 as uuidv4 } from "uuid";
import {
  AUTH_JWT_CACHE_PREFIX,
  AUTH_REFRESH_TOKEN_PREFIX,
  AuthService,
  bruteForceIPKey,
  bruteForceLoginKey,
  jwtAccessTokenKey,
  jwtRefreshTokenKey,
  REFRESH_TOKEN_ERROR_MSG,
  UNKNOWN_IP,
} from "./auth.constants";
import { LOGGER } from "../../shared/modules/log/log.constants";
import { User, UserService } from "../user/user.types";
import { CacheService } from "../../shared/modules/cache/cache.types";
import { AuthConfig } from "../../../gen-src/auth.config";
import { BruteforceConfig } from "../../../gen-src/bruteforce.config";

/**
 * A service for authentication and authorization using JSON Web Tokens (JWT) and handling brute force protection.
 * This service provides methods to authenticate users, invalidate tokens, exchange tokens, and manage failed attempts.
 */
@Injectable()
export class AuthorizationService extends AuthService {
  constructor(
    @Inject(LOGGER) private readonly logger: Logger,
    private readonly userService: UserService,
    private readonly cacheService: CacheService,
    private readonly jwtService: JwtService,
  ) {
    super();
  }

  /**
   * Authenticate the user with the provided login payload.
   * @param data - LoginPayload object with user login information.
   * @returns A Promise that resolves to a JwtDto containing access and refresh tokens.
   * @throws UnauthorizedException unauthorized exception if authentication fails.
   * @throws InternalServerErrorException if too many login attempts are detected.
   */
  async authenticate(data: LoginPayload): Promise<JwtDto> {
    if (!data.ipAddress?.length) {
      data.ipAddress = UNKNOWN_IP;
    }
    const isBlocked = await this.isBlocked(data.login, data.ipAddress);
    if (isBlocked) {
      this.logger.warn(
        `Too many login attempts for ${data.login} from ${data.ipAddress}`,
      );
      throw new InternalServerErrorException(HttpStatus.TOO_MANY_REQUESTS);
    }
    const user = await this.validateUser(data);
    if (!user) {
      this.logger.debug(`Invalid credentials for user ${data.login}`);
      await this.registerFailedAttempt(data.login, data.ipAddress);
      throw new UnauthorizedException();
    }
    await this.resetFailedAttempts(data.login, data.ipAddress);
    const accessToken = this.jwtService.sign({ login: user.login });
    const atExp = await this.getAccessTokenExp();
    await this.cacheService.set(
      jwtAccessTokenKey(accessToken),
      user.login,
      atExp,
    );
    const refreshToken = this.jwtService.sign({ rt: uuidv4() });
    const rtExp = await this.getRefreshTokenExp();
    await this.cacheService.set(
      jwtRefreshTokenKey(accessToken, refreshToken),
      user.login,
      rtExp,
    );
    const atExpDate = new Date();
    atExpDate.setTime(atExpDate.getTime() + atExp * 1000);
    const rtExpDate = new Date();
    rtExpDate.setTime(rtExpDate.getTime() + rtExp * 1000);
    this.logger.debug(`Create token pair for user ${data.login}`);
    return {
      user,
      accessToken,
      refreshToken,
      atExp: atExpDate,
      rtExp: rtExpDate,
    };
  }

  /**
   * Invalidate the specified access token.
   * @param accessToken - The access token to invalidate.
   * @returns A Promise that resolves to true if the token was invalidated successfully, or throws an error.
   * @throws UnauthorizedException if related user for access token not exists.
   */
  async invalidateToken(accessToken: string) {
    const userLogin = await this.cacheService.get(
      jwtAccessTokenKey(accessToken),
    );
    if (userLogin) {
      this.logger.debug(`Invalidating access token for user ${userLogin}`);
      await this.deleteAccessToken(accessToken);
      await this.deleteRefreshTokens(
        accessToken,
        jwtRefreshTokenKey(accessToken, "*"),
      );
    } else {
      this.logger.warn(
        `Attempt to invalidate an invalid token: ${accessToken}`,
      );
      throw new UnauthorizedException();
    }
    return true;
  }

  /**
   * Exchange the provided refresh token for a new access token.
   * @param refreshToken - The refresh token to exchange.
   * @returns A Promise that resolves to a Partial<JwtDto> containing a new access and refresh tokens.
   * @throws UnauthorizedException unauthorized exception if exchange fails.
   */
  async exchangeToken(refreshToken: string): Promise<Partial<JwtDto>> {
    const refreshTokenKeyPattern = jwtRefreshTokenKey("*", refreshToken);
    const refreshTokenKeys = await this.cacheService.getFromPattern(
      refreshTokenKeyPattern,
    );
    if (!refreshTokenKeys?.length) {
      this.logger.warn(
        `Attempt to exchange an invalid refresh token: ${refreshToken}`,
      );
      throw new UnauthorizedException(REFRESH_TOKEN_ERROR_MSG);
    }
    const refreshTokenKey = refreshTokenKeys[0];
    const userLogin = await this.cacheService.get(refreshTokenKey);
    if (!userLogin) {
      throw new UnauthorizedException(REFRESH_TOKEN_ERROR_MSG);
    }
    const accessToken = this.jwtService.sign({ login: userLogin });
    const atExp = await this.getAccessTokenExp();
    await this.cacheService.set(
      jwtAccessTokenKey(accessToken),
      userLogin,
      atExp,
    );
    const newRefreshToken = this.jwtService.sign({ rt: uuidv4() });
    const rtExp = await this.getRefreshTokenExp();
    await this.cacheService.set(
      `${AUTH_JWT_CACHE_PREFIX}:${AUTH_REFRESH_TOKEN_PREFIX}:${accessToken}:${newRefreshToken}`,
      userLogin,
      rtExp,
    );
    // extract related access token for delete
    const oldAccessToken =
      this.extractAccessTokenFromRefreshTokenKey(refreshTokenKey);
    await this.deleteAccessToken(oldAccessToken);
    await this.deleteRefreshTokens(oldAccessToken, refreshTokenKey);
    this.logger.debug(`Exchange token pair for user: ${userLogin}`);
    return { accessToken, refreshToken: newRefreshToken };
  }

  /**
   * Check if the user is blocked due to too many failed login attempts.
   * @param login - The user's login.
   * @param ipAddress - The IP address of the user.
   * @returns A Promise that resolves to true if the user is blocked, false otherwise.
   */
  private async isBlocked(login: string, ipAddress: string): Promise<boolean> {
    const bfEnabled = await this.getBruteForceEnabled();
    if (!bfEnabled) {
      return false;
    }
    const loginKey = bruteForceLoginKey(login);
    const ipKey = bruteForceIPKey(ipAddress);
    const [loginAttempts, ipAttempts] = await Promise.all([
      this.cacheService.get(loginKey),
      this.cacheService.get(ipKey),
    ]);
    const bfMaxAt = await this.getBruteForceMaxAttempts();
    return (
      (loginAttempts && parseInt(loginAttempts, 10) >= bfMaxAt) ||
      (ipAttempts && parseInt(ipAttempts, 10) >= bfMaxAt)
    );
  }

  /**
   * Register a failed login attempt.
   * @param login - The user's login.
   * @param ipAddress - The IP address of the user.
   */
  private async registerFailedAttempt(
    login: string,
    ipAddress: string,
  ): Promise<void> {
    const bfEnabled = await this.getBruteForceEnabled();
    if (!bfEnabled) {
      return;
    }
    this.logger.debug(
      `Registering failed login attempt for ${login} from ${ipAddress}`,
    );
    const loginKey = bruteForceLoginKey(login);
    const ipKey = bruteForceIPKey(ipAddress);
    const [loginAttempts, ipAttempts] = await Promise.all([
      this.cacheService.get(loginKey),
      this.cacheService.get(ipKey),
    ]);
    const blockDuration = await this.getBruteForceBlockDuration();
    const loginUpdate = loginAttempts
      ? this.cacheService.incr(loginKey)
      : this.cacheService.set(loginKey, 1, blockDuration);
    const ipUpdate = ipAttempts
      ? this.cacheService.incr(ipKey)
      : this.cacheService.set(ipKey, 1, blockDuration);
    await Promise.all([loginUpdate, ipUpdate]);
  }

  /**
   * Reset failed login attempts for a user.
   * @param login - The user's login.
   * @param ipAddress - The IP address of the user.
   */
  private async resetFailedAttempts(
    login: string,
    ipAddress: string,
  ): Promise<void> {
    const bfEnabled = await this.getBruteForceEnabled();
    if (!bfEnabled) {
      return;
    }
    this.logger.debug(
      `Resetting failed login attempts for ${login} from ${ipAddress}`,
    );
    const loginKey = bruteForceLoginKey(login);
    const ipKey = bruteForceIPKey(ipAddress);
    await this.cacheService.del(loginKey, ipKey);
  }

  /**
   * Validate user credentials.
   * @param payload - The login payload containing user credentials.
   * @returns A Promise that resolves to the user object if validation is successful, null otherwise.
   */
  private async validateUser(payload: LoginPayload): Promise<User> {
    const user = await this.userService.findByLogin(payload.login);
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

  /**
   * Extract access token from refresh token key.
   * @param refreshTokenKey - The refresh token key.
   * @returns The access token if extraction is successful, null otherwise.
   */
  private extractAccessTokenFromRefreshTokenKey(refreshTokenKey: string) {
    const regex = new RegExp(
      `${AUTH_JWT_CACHE_PREFIX}:${AUTH_REFRESH_TOKEN_PREFIX}:(.*):[^:]*$`,
    );
    const parts = refreshTokenKey.match(regex);
    if (parts?.length) {
      return parts[1];
    }
    return null;
  }

  /**
   * Delete an access token.
   * @param accessToken - The access token to delete.
   */
  private async deleteAccessToken(accessToken: string): Promise<void> {
    this.logger.debug(`Deleting access token: ${accessToken}`);
    await this.cacheService.del(jwtAccessTokenKey(accessToken));
  }

  /**
   * Delete refresh tokens associated with an access token.
   * @param accessToken - The access token.
   * @param pattern - The pattern to match refresh token keys.
   */
  private async deleteRefreshTokens(
    accessToken: string,
    pattern: string,
  ): Promise<void> {
    this.logger.debug(
      `Deleting refresh tokens for access token: ${accessToken}`,
    );
    const refreshTokenKeys = await this.cacheService.getFromPattern(pattern);
    if (refreshTokenKeys?.length > 0) {
      await this.cacheService.del(...refreshTokenKeys);
    }
  }

  /**
   * Get the access token expiration time defined in configuration.
   * @returns A Promise that resolves to the access token expiration time.
   */
  private async getAccessTokenExp() {
    return await this.cacheService.getNumber(
      AuthConfig.ACCESS_TOKEN_EXPIRATION,
    );
  }

  /**
   * Get the refresh token expiration time defined in configuration.
   * @returns A Promise that resolves to the refresh token expiration time.
   */
  private async getRefreshTokenExp() {
    return await this.cacheService.getNumber(
      AuthConfig.REFRESH_TOKEN_EXPIRATION,
    );
  }

  /**
   * Get the maximum number of brute force attempts allowed defined in configuration.
   * @returns A Promise that resolves to the maximum number of attempts.
   */
  private async getBruteForceMaxAttempts() {
    return await this.cacheService.getNumber(BruteforceConfig.MAX_ATTEMPTS);
  }

  /**
   * Check if brute force protection is enabled.
   * @returns A Promise that resolves to true if brute force protection is enabled, false otherwise.
   */
  private async getBruteForceEnabled() {
    return await this.cacheService.getBoolean(BruteforceConfig.ENABLED);
  }

  /**
   * Get the duration for which a user is blocked after reaching the maximum number of failed attempts.
   * @returns A Promise that resolves to the block duration in seconds.
   */
  private async getBruteForceBlockDuration() {
    return await this.cacheService.getNumber(BruteforceConfig.BLOCK_DURATION);
  }
}
