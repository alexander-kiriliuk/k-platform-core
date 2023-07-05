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
import { MockCacheService } from "@shared/modules/cache/mock/mock-cache.service";
import { TooManyRequestsMsException } from "@shared/exceptions/too-many-requests-ms.exception";
import { AuthMock } from "@auth/src/mock/auth.mock";
import { UnauthorizedMsException } from "@shared/exceptions/unauthorized-ms.exception";
import { MockMsClient } from "@shared/modules/ms-client/mock/mock-ms-client";
import { MessageBus } from "@shared/modules/ms-client/ms-client.types";
import { bruteForceIPKey } from "@auth/src/auth.constants";
import { InvalidTokenMsException } from "@shared/exceptions/invalid-token-ms.exception";
import { LoggerMock } from "@shared/modules/mock/logger.mock";

describe("AuthService", () => {

  let authService: AuthService;
  let cacheService: MockCacheService;
  let bus: MessageBus;

  beforeEach(async () => {
    cacheService = new MockCacheService(AuthMock.Storage);
    bus = new MockMsClient(AuthMock.Storage);
    authService = new AuthService(LoggerMock, bus, cacheService, AuthMock.jwtService);
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
      let attempts = await cacheService.getNumber(ipKey);
      expect(attempts).toBe(1);
      await expect(authService.authenticate(AuthMock.wrongCredentialsUsrPayload))
        .rejects.toThrow(UnauthorizedMsException);
      attempts = await cacheService.getNumber(ipKey);
      expect(attempts).toBe(2);
      await authService.authenticate(AuthMock.validCredentialsUsrPayload);
      attempts = await cacheService.getNumber(ipKey);
      if (isNaN(attempts) || typeof attempts !== "number") {
        attempts = 0;
      }
      expect(attempts).toBe(0);
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

  describe("invalidateToken", () => {

    it("success invalidate if token exists in db", async () => {
      const result = await authService.invalidateToken(AuthMock.validAccessToken);
      expect(result).toBeDefined();
      expect(result).toBe(true);
    });

    it("fail invalidate if token not exists in db", async () => {
      await expect(authService.invalidateToken("fake-token")).rejects.toThrow(InvalidTokenMsException);
    });

  });

  describe("exchangeToken", () => {

    it("throw error if refresh token not exists in db", async () => {
      await expect(authService.exchangeToken("fake-token")).rejects.toThrow(InvalidTokenMsException);
    });

    it("throw error if related user for refresh token not exists in db", async () => {
      await expect(authService.exchangeToken(AuthMock.refreshTokenWithoutRelatedUser))
        .rejects.toThrow(UnauthorizedMsException);
    });

    it("return JWT if tokens success exchanged", async () => {
      const result = await authService.exchangeToken(AuthMock.validRefreshToken);
      expect(result).toBeDefined();
      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
      expect(typeof result.accessToken).toBe("string");
      expect(typeof result.refreshToken).toBe("string");
    });

  });

});

