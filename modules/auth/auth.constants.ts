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

import { JwtDto, LoginPayload } from "@auth/auth.types";

export const ACCESS_TOKEN_ERROR_MSG = "ERR_TOKEN_A";
export const REFRESH_TOKEN_ERROR_MSG = "ERR_TOKEN_R";
export const UNKNOWN_IP = "unknown";
export const AUTH_JWT_CACHE_PREFIX = "jwt";
export const AUTH_ACCESS_TOKEN_PREFIX = "access_token";
export const AUTH_REFRESH_TOKEN_PREFIX = "refresh_token";
export const BRUTEFORCE_JWT_CACHE_PREFIX = "bruteforce";

export const jwtAccessTokenKey = (accessToken: string) => {
  return `${AUTH_JWT_CACHE_PREFIX}:${AUTH_ACCESS_TOKEN_PREFIX}:${accessToken}`;
};

export const jwtRefreshTokenKey = (accessToken: string, refreshToken: string) => {
  return `${AUTH_JWT_CACHE_PREFIX}:${AUTH_REFRESH_TOKEN_PREFIX}:${accessToken}:${refreshToken}`;
};

export const bruteForceLoginKey = (login: string) => `${BRUTEFORCE_JWT_CACHE_PREFIX}:login:${login}`;

export const bruteForceIPKey = (ipAddress: string) => `${BRUTEFORCE_JWT_CACHE_PREFIX}:ip:${ipAddress}`;

export abstract class AuthService {

  abstract authenticate(data: LoginPayload): Promise<JwtDto>;

  abstract invalidateToken(accessToken: string);

  abstract exchangeToken(refreshToken: string): Promise<Partial<JwtDto>>;

}