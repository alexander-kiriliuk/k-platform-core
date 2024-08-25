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

import { IsIP, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Expose, Transform, Type } from "class-transformer";
import { Type as Class } from "@nestjs/common";
import { UserDto } from "../user/user.types";
import { TransformUtils } from "../../shared/utils/transform.utils";
import { AuthService } from "./auth.constants";
import { Request, Response } from "express";

/**
 * Data transfer object for login payload.
 * Contains user login information required for authentication.
 */
export class LoginPayload {
  /**
   * The login of the user.
   * @example ```typescript
   * "admin"
   */
  @IsString()
  @IsNotEmpty()
  login: string;

  /**
   * The password of the user.
   * @example ```typescript
   * "P@ssw0rd!"
   */
  @IsString()
  @IsNotEmpty()
  password: string;

  /**
   * The IP address of the user.
   * Optional.
   * @example ```typescript
   * "192.168.0.1"
   */
  @IsIP()
  @IsOptional()
  ipAddress: string;

  /**
   * The ID of the captcha.
   * Optional.
   */
  @IsString()
  @IsOptional()
  captchaId?: string;

  /**
   * The payload of the captcha.
   * Optional.
   */
  @IsString()
  @IsOptional()
  captchaPayload?: string;
}

/**
 * Data transfer object for token exchange payload.
 * Contains the token to be exchanged for a new token pair JwtDto.
 */
export class ExchangeTokenPayload {
  /**
   * The refresh token to be exchanged.
   */
  @IsString()
  @IsOptional()
  token: string;
}

/**
 * Data transfer object for JWT tokens.
 * Contains access and refresh tokens along with their expiration dates and user information.
 */
export class JwtDto {
  /**
   * The user-data object.
   */
  @Expose()
  @Type(() => UserDto)
  user: UserDto;

  /**
   * The access token.
   */
  @Expose()
  accessToken: string;

  /**
   * The refresh token.
   */
  @Expose()
  refreshToken: string;

  /**
   * The expiration date of the access token.
   */
  @Transform(TransformUtils.dateToTime)
  atExp: Date;

  /**
   * The expiration date of the refresh token.
   */
  @Transform(TransformUtils.dateToTime)
  rtExp: Date;
}

export interface BasicAuthController {
  login(
    payload: LoginPayload,
    request: Request,
    response: Response,
  ): Promise<JwtDto>;

  logout(token: string, response: Response): Promise<{ result: unknown }>;

  exchange(
    payload: ExchangeTokenPayload,
    request: Request,
    response: Response,
  ): Promise<Partial<JwtDto>>;
}

/**
 * Options for configuring the authentication module.
 * @property service - The authentication service class.
 */
export type AuthModuleOptions = {
  service: Class<AuthService>;
  controller: Class<BasicAuthController>;
};
