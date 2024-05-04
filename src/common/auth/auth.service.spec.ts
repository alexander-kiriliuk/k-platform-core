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

import { AuthorizationService } from "./authorization.service";
import { AuthMock } from "./mock/auth.mock";
import { bruteForceIPKey } from "./auth.constants";
import { InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { MockCacheService } from "../../shared/modules/cache/mock/mock-cache.service";
import { BasicUserService } from "../user/user-service-basic.service";
import { UserEntity } from "../user/entity/user.entity";
import { LoggerMock } from "../../shared/modules/mock/logger.mock";

describe("AuthService", () => {
  let authService: AuthorizationService;
  let cacheService: MockCacheService;
  let userService: BasicUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BasicUserService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            save: jest.fn(),
            create: jest.fn()
          },
        },
      ],
    }).compile();
    userService = module.get<BasicUserService>(BasicUserService);
    cacheService = new MockCacheService(AuthMock.Storage);
    authService = new AuthorizationService(
      LoggerMock,
      userService,
      cacheService,
      AuthMock.jwtService
    );
  });

  describe("authenticate", () => {
    it("throw error if user is blocked by login", async () => {
      await expect(
        authService.authenticate(AuthMock.blockedUsrLoginPayload)
      ).rejects.toThrow(InternalServerErrorException);
    });

    it("throw error if user is blocked by ip address", async () => {
      await expect(
        authService.authenticate(AuthMock.blockedUsrIpPayload)
      ).rejects.toThrow(InternalServerErrorException);
    });

    it("throw error if credentials are invalid", async () => {
      await expect(
        authService.authenticate(AuthMock.wrongCredentialsUsrPayload)
      ).rejects.toThrow(UnauthorizedException);
    });

    it("write and clean failed auth attempt", async () => {
      const ipKey = bruteForceIPKey(
        AuthMock.wrongCredentialsUsrPayload.ipAddress
      );
      await cacheService.del(ipKey);
      await expect(
        authService.authenticate(AuthMock.wrongCredentialsUsrPayload)
      ).rejects.toThrow(UnauthorizedException);
      let attempts = await cacheService.getNumber(ipKey);
      expect(attempts).toBe(1);
      await expect(
        authService.authenticate(AuthMock.wrongCredentialsUsrPayload)
      ).rejects.toThrow(UnauthorizedException);
      attempts = await cacheService.getNumber(ipKey);
      expect(attempts).toBe(2);
      jest
        .spyOn(userService, "findByLogin")
        .mockResolvedValue(AuthMock.testUser as UserEntity);
      await authService.authenticate(AuthMock.validCredentialsUsrPayload);
      attempts = await cacheService.getNumber(ipKey);
      if (isNaN(attempts) || typeof attempts !== "number") {
        attempts = 0;
      }
      expect(attempts).toBe(0);
    });

    it("return JWT if credentials are valid", async () => {
      jest
        .spyOn(userService, "findByLogin")
        .mockResolvedValue(AuthMock.testUser as UserEntity);
      const result = await authService.authenticate(
        AuthMock.validCredentialsUsrPayload
      );
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
      const result = await authService.invalidateToken(
        AuthMock.validAccessToken
      );
      expect(result).toBeDefined();
      expect(result).toBe(true);
    });

    it("fail invalidate if token not exists in db", async () => {
      await expect(authService.invalidateToken("fake-token")).rejects.toThrow(
        UnauthorizedException
      );
    });
  });

  describe("exchangeToken", () => {
    it("throw error if refresh token not exists in db", async () => {
      await expect(authService.exchangeToken("fake-token")).rejects.toThrow(
        UnauthorizedException
      );
    });

    it("throw error if related user for refresh token not exists in db", async () => {
      await expect(
        authService.exchangeToken(AuthMock.refreshTokenWithoutRelatedUser)
      ).rejects.toThrow(UnauthorizedException);
    });

    it("return JWT if tokens success exchanged", async () => {
      const result = await authService.exchangeToken(
        AuthMock.validRefreshToken
      );
      expect(result).toBeDefined();
      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
      expect(typeof result.accessToken).toBe("string");
      expect(typeof result.refreshToken).toBe("string");
    });
  });
});
