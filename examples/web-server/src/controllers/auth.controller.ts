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
  Body,
  Controller,
  ForbiddenException,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import {
  AccessToken,
  AuthService,
  CacheService,
  CaptchaService,
  ExchangeTokenPayload,
  JwtDto,
  LiteAuthGuard,
  LoginPayload,
  ResponseDto,
} from "@k-platform/core";
import { Request, Response } from "express";
import { CaptchaConfig } from "@gen-src/captcha.config";

@Controller("/auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cacheService: CacheService,
    private readonly captchaService: CaptchaService,
  ) {}

  @ResponseDto(JwtDto)
  @Post("/login")
  async login(
    @Body() payload: LoginPayload,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const captchaEnabled = await this.cacheService.getBoolean(
      CaptchaConfig.ENABLED,
    );
    if (captchaEnabled) {
      const res = await this.captchaService.validateCaptcha({
        id: payload.captchaId,
        data: payload.captchaPayload,
      });
      if (!res) {
        throw new ForbiddenException("Invalid captcha");
      }
    }
    if (request.ip) {
      payload.ipAddress = request.ip;
    }
    const data = await this.authService.authenticate(payload);
    response.cookie("accessToken", data.accessToken, {
      sameSite: true,
      httpOnly: true,
      expires: data.atExp,
    });
    response.cookie("refreshToken", data.refreshToken, {
      sameSite: true,
      httpOnly: true,
      expires: data.rtExp,
    });
    return data;
  }

  @UseGuards(LiteAuthGuard)
  @Post("/logout")
  async logout(
    @AccessToken() token: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.invalidateToken(token);
    response.clearCookie("accessToken");
    response.clearCookie("refreshToken");
    return { result };
  }

  @ResponseDto(JwtDto)
  @Post("/exchange-token")
  async exchange(
    @Body() payload: ExchangeTokenPayload,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const token = payload?.token ?? request.cookies?.refreshToken;
    const data = await this.authService.exchangeToken(token);
    response.cookie("accessToken", data.accessToken, {
      sameSite: true,
      httpOnly: true,
      expires: data.atExp,
    });
    response.cookie("refreshToken", data.refreshToken, {
      sameSite: true,
      httpOnly: true,
      expires: data.rtExp,
    });
    return data;
  }
}
