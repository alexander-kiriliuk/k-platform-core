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


import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "@auth/src/auth.controller";
import { AuthService } from "@auth/src/auth.service";
import { LOGGER } from "@shared/modules/log/log.constants";
import { MSG_BUS } from "@shared/modules/ms-client/ms-client.constants";
import { CacheService } from "@shared/modules/cache/cache.types";
import { JwtService } from "@nestjs/jwt";
import { JwtDto } from "@auth/src/auth.types";
import { AuthMock } from "@auth/src/mock/auth.mock";
import { TooManyRequestsMsException } from "@shared/exceptions/too-many-requests-ms.exception";
import { UnauthorizedMsException } from "@shared/exceptions/unauthorized-ms.exception";

describe("AuthController", () => {

  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: LOGGER,
          useValue: {}
        },
        {
          provide: MSG_BUS,
          useValue: {}
        },
        {
          provide: CacheService,
          useValue: {}
        },
        {
          provide: JwtService,
          useValue: {}
        }
      ]
    }).compile();
    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it("authenticate user: success", async () => {
    const jwtDto = { user: {}, accessToken: "accessToken", refreshToken: "refreshToken" } as JwtDto;
    jest.spyOn(authService, "authenticate").mockImplementation(async () => jwtDto);
    const res = await authController.login(AuthMock.validCredentialsUsrPayload);
    expect(res).toBe(jwtDto);
  });

  it("authenticate user: many wrong attempts", async () => {
    jest.spyOn(authService, "authenticate").mockRejectedValue(new TooManyRequestsMsException());
    await expect(authController.login(AuthMock.wrongCredentialsUsrPayload))
      .rejects.toThrow(TooManyRequestsMsException);
  });

  it("authenticate user: invalid credentials", async () => {
    jest.spyOn(authService, "authenticate").mockRejectedValue(new UnauthorizedMsException());
    await expect(authController.login(AuthMock.wrongCredentialsUsrPayload))
      .rejects.toThrow(UnauthorizedMsException);
  });

  it("invalidate user credentials", async () => {
    jest.spyOn(authService, "invalidateToken").mockImplementation(async () => true);
    const res = await authController.logout(AuthMock.validAccessToken);
    expect(res).toBe(true);
  });

  it("exchange user credentials", async () => {
    const jwtDto = { accessToken: "accessToken", refreshToken: "refreshToken" } as Partial<JwtDto>;
    jest.spyOn(authService, "exchangeToken").mockImplementation(async () => jwtDto);
    const res = await authController.exchange(AuthMock.validRefreshToken);
    expect(res).toBe(jwtDto);
  });

});