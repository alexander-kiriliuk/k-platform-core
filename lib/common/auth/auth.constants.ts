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

import { JwtDto, LoginPayload } from "./auth.types";

/**
 * Error message for access token related errors.
 * @constant
 */
export const ACCESS_TOKEN_ERROR_MSG = "ERR_TOKEN_A";

/**
 * Error message for refresh token related errors.
 * @constant
 */
export const REFRESH_TOKEN_ERROR_MSG = "ERR_TOKEN_R";

/**
 * Placeholder for unknown IP addresses.
 * @constant
 */
export const UNKNOWN_IP = "unknown";

/**
 * Prefix for JWT cache keys.
 * @constant
 */
export const AUTH_JWT_CACHE_PREFIX = "jwt";

/**
 * Prefix for access token cache keys.
 * @constant
 */
export const AUTH_ACCESS_TOKEN_PREFIX = "access_token";

/**
 * Prefix for refresh token cache keys.
 * @constant
 */
export const AUTH_REFRESH_TOKEN_PREFIX = "refresh_token";

/**
 * Prefix for brute force protection cache keys.
 * @constant
 */
export const BRUTEFORCE_JWT_CACHE_PREFIX = "bruteforce";

/**
 * Generates a cache key for an access token.
 * @param accessToken - The access token.
 * @returns The generated cache key.
 */
export const jwtAccessTokenKey = (accessToken: string) => {
  return `${AUTH_JWT_CACHE_PREFIX}:${AUTH_ACCESS_TOKEN_PREFIX}:${accessToken}`;
};

/**
 * Generates a cache key for a refresh token.
 * @param accessToken - The access token.
 * @param refreshToken - The refresh token.
 * @returns The generated cache key.
 */
export const jwtRefreshTokenKey = (
  accessToken: string,
  refreshToken: string,
) => {
  return `${AUTH_JWT_CACHE_PREFIX}:${AUTH_REFRESH_TOKEN_PREFIX}:${accessToken}:${refreshToken}`;
};

/**
 * Generates a cache key for tracking brute force login attempts by login.
 * @param login - The user's login.
 * @returns The generated cache key.
 */
export const bruteForceLoginKey = (login: string) =>
  `${BRUTEFORCE_JWT_CACHE_PREFIX}:login:${login}`;

/**
 * Generates a cache key for tracking brute force login attempts by IP address.
 * @param ipAddress - The IP address of the user.
 * @returns The generated cache key.
 */
export const bruteForceIPKey = (ipAddress: string) =>
  `${BRUTEFORCE_JWT_CACHE_PREFIX}:ip:${ipAddress}`;

/**
 * Abstract service class for authentication and authorization.
 * Defines the methods that must be implemented by any derived service.
 */
export abstract class AuthService {
  /**
   * Authenticate the user with the provided login payload.
   * @param data - LoginPayload object with user login information.
   * @returns A Promise that resolves to a JwtDto containing access and refresh tokens.
   */
  abstract authenticate(data: LoginPayload): Promise<JwtDto>;

  /**
   * Invalidate the specified access token.
   * @param accessToken - The access token to invalidate.
   * @returns A Promise that resolves to true if the token was invalidated successfully, or throws an error.
   */
  abstract invalidateToken(accessToken: string);

  /**
   * Exchange the provided refresh token for a new access token.
   * @param refreshToken - The refresh token to exchange.
   * @returns A Promise that resolves to a Partial<JwtDto> containing new access and refresh tokens.
   */
  abstract exchangeToken(refreshToken: string): Promise<Partial<JwtDto>>;
}
