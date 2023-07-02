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


import { AuthService } from "@auth/src/auth.service";
import { JwtService } from "@nestjs/jwt";
import { MockCacheService } from "@shared/modules/cache/mock/mock-cache.service";
import { TooManyRequestsMsException } from "@shared/exceptions/too-many-requests-ms.exception";
import { AuthMock } from "@auth/src/mock/auth.mock";
import { UnauthorizedMsException } from "@shared/exceptions/unauthorized-ms.exception";
import { MockMsClient } from "@shared/modules/ms-client/mock/mock-ms-client";
import { MessageBus } from "@shared/modules/ms-client/ms-client.types";
import { v4 as uuidv4 } from "uuid";
import { bruteForceIPKey } from "@auth/src/auth.constants";

describe("AuthService", () => {

  let authService: AuthService;
  let jwtService: jest.Mocked<JwtService>;
  let cacheService: MockCacheService;
  let bus: MessageBus;

  beforeEach(async () => {
    const logger = { warn: jest.fn(), debug: jest.fn(), verbose: jest.fn() };
    cacheService = new MockCacheService(AuthMock.Storage);
    bus = new MockMsClient(AuthMock.Storage);
    jwtService = { sign: () => uuidv4() } as any;
    authService = new AuthService(logger as any, bus, cacheService, jwtService);
  });

  describe("authenticate", () => {

    it("throw error if user is blocked by login", async () => {
      await expect(authService.authenticate(AuthMock.blockedUsrLoginPayload))
        .rejects.toThrow(TooManyRequestsMsException);
    });

    it("throw error if user is blocked by ip address", async () => {
      await expect(authService.authenticate(AuthMock.blockedUsrIpPayload))
        .rejects.toThrow(TooManyRequestsMsException);
    });

    it("throw error if credentials are invalid", async () => {
      await expect(authService.authenticate(AuthMock.wrongCredentialsUsrPayload))
        .rejects.toThrow(UnauthorizedMsException);
    });

    it("write and clean failed auth attempt", async () => {
      const ipKey = bruteForceIPKey(AuthMock.wrongCredentialsUsrPayload.ipAddress);
      await cacheService.del(ipKey);
      await expect(authService.authenticate(AuthMock.wrongCredentialsUsrPayload))
        .rejects.toThrow(UnauthorizedMsException);
      let tries = await cacheService.getNumber(ipKey);
      expect(tries).toBe(1);
      await expect(authService.authenticate(AuthMock.wrongCredentialsUsrPayload))
        .rejects.toThrow(UnauthorizedMsException);
      tries = await cacheService.getNumber(ipKey);
      expect(tries).toBe(2);
      await authService.authenticate(AuthMock.validCredentialsUsrPayload);
      tries = await cacheService.getNumber(ipKey);
      if (isNaN(tries) || typeof tries !== "number") {
        tries = 0;
      }
      expect(tries).toBe(0);
    });

    it("return JWT if credentials are valid", async () => {
      const result = await authService.authenticate(AuthMock.validCredentialsUsrPayload);
      expect(result).toBeDefined();
      expect(result).toHaveProperty("user");
      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
      expect(typeof result.accessToken).toBe("string");
      expect(typeof result.refreshToken).toBe("string");
      expect(result.user).toHaveProperty("id");
      expect(result.user).toHaveProperty("login");
    });

  });

  describe("exchangeToken", () => {

    it("throw error if refresh token not exists in db", async () => {
      // todo test
    });

    it("throw error if related user for refresh token not exists in db", async () => {
      // todo test
    });

    it("return JWT if tokens success exchanged", async () => {
      // todo test
    });

  });

  describe("invalidateToken", () => {

    it("success invalidate if token exists in db", async () => {
      // todo test
    });

    it("fail invalidate if token not exists in db", async () => {
      // todo test
    });

  });

});

