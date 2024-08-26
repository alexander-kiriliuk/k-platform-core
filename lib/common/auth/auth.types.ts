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

/**
 * Interface representing the basic functionality for an authentication controller.
 */
export interface BasicAuthController {
  /**
   * Handles user login by validating the provided credentials, generating JWT tokens,
   * and setting them as HTTP-only cookies.
   * @param payload - The login credentials, including username, password, and optional captcha data.
   * @param request - The incoming HTTP request object.
   * @param response - The HTTP response object where cookies will be set.
   * @returns A promise that resolves to a JWT data transfer object containing access and refresh tokens.
   */
  login(
    payload: LoginPayload,
    request: Request,
    response: Response,
  ): Promise<JwtDto>;

  /**
   * Logs out the user by invalidating the provided access token and clearing related cookies.
   * @param token - The JWT access token that needs to be invalidated.
   * @param response - The HTTP response object where cookies will be cleared.
   * @returns A promise that resolves to an object indicating the result of the logout operation.
   */
  logout(token: string, response: Response): Promise<{ result: unknown }>;

  /**
   * Exchanges a refresh token for a new set of access and refresh tokens.
   * The new tokens are set as HTTP-only cookies.
   * @param payload - The payload containing the refresh token to be exchanged.
   * @param request - The incoming HTTP request object.
   * @param response - The HTTP response object where new cookies will be set.
   * @returns A promise that resolves to a partial JWT data transfer object containing the new tokens.
   */
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
