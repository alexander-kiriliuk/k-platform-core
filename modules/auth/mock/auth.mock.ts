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

import { MockStorage } from "@shared/modules/mock/mock.storage";
import { BruteforceConfig } from "@auth/gen-src/bruteforce.config";
import {
  AUTH_ACCESS_TOKEN_PREFIX,
  AUTH_JWT_CACHE_PREFIX,
  AUTH_REFRESH_TOKEN_PREFIX,
  BRUTEFORCE_JWT_CACHE_PREFIX
} from "@auth/auth.constants";
import { LoginPayload } from "@auth/auth.types";
import { User } from "@user/user.types";
import { v4 as uuidv4 } from "uuid";
import { JwtService } from "@nestjs/jwt";

export namespace AuthMock {

  export const jwtService: jest.Mocked<JwtService> = { sign: () => uuidv4() } as any;
  export const blockedUsrLoginPayload: LoginPayload = {
    login: "blockedUserByLogin",
    password: "1111",
    ipAddress: "123.123.123.123"
  };

  export const blockedUsrIpPayload: LoginPayload = {
    login: "blockedUserByIp",
    password: "1111",
    ipAddress: "111.111.111.111"
  };

  export const wrongCredentialsUsrPayload: LoginPayload = {
    login: "wrongCredentialsUsr",
    password: "1111",
    ipAddress: "123.123.123.123"
  };

  export const validCredentialsUsrPayload: LoginPayload = {
    login: "test",
    password: "1111",
    ipAddress: "123.123.123.123"
  };

  export const testUser: User = {
    id: "12345",
    login: "test",
    password: "$2b$10$pLGG/FWq1krOgl8wg05.DeoC5WlNEYOhuX7zYbtJlYQ0aZjKaMmIe"  // encrypted string "1111"
  } as User;

  export const validAccessToken = "valid-access-token";
  export const validRefreshToken = "valid-refresh-token";
  export const refreshTokenWithoutRelatedUser = "no-user-refresh-token";

  export const Storage = new MockStorage([
    {
      key: BruteforceConfig.ENABLED, data: "true"
    },
    {
      key: BruteforceConfig.MAX_ATTEMPTS, data: 3
    },
    {
      key: `${BRUTEFORCE_JWT_CACHE_PREFIX}:login:${blockedUsrLoginPayload.login}`, data: 10
    },
    {
      key: `${BRUTEFORCE_JWT_CACHE_PREFIX}:ip:${blockedUsrIpPayload.ipAddress}`, data: 10
    },
    {
      key: "user.find.by.login", data: null, params: wrongCredentialsUsrPayload.login
    },
    {
      key: "user.find.by.login", data: testUser, params: validCredentialsUsrPayload.login
    },
    {
      key: `${AUTH_JWT_CACHE_PREFIX}:${AUTH_ACCESS_TOKEN_PREFIX}:${validAccessToken}`, data: testUser
    },
    {
      key: `${AUTH_JWT_CACHE_PREFIX}:${AUTH_REFRESH_TOKEN_PREFIX}:${validAccessToken}:*`, data: testUser
    },
    {
      key: `${AUTH_JWT_CACHE_PREFIX}:${AUTH_REFRESH_TOKEN_PREFIX}:*:${refreshTokenWithoutRelatedUser}`, data: undefined
    },
    {
      key: `${AUTH_JWT_CACHE_PREFIX}:${AUTH_REFRESH_TOKEN_PREFIX}:*:${validRefreshToken}`, data: [
        validRefreshToken
      ]
    },
    {
      key: validRefreshToken, data: testUser.login
    }
  ]);
}
