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

import { UserDto } from "@user/user.types";
import { IsIP, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Expose, Transform, Type } from "class-transformer";
import { Type as Class } from "@nestjs/common";
import { AuthService } from "@auth/auth.constants";
import { TransformUtils } from "@shared/utils/transform.utils";

export class LoginPayload {

  @IsString()
  @IsNotEmpty()
  login: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsIP()
  @IsOptional()
  ipAddress: string;

}

export class ExchangeTokenPayload {

  @IsString()
  @IsNotEmpty()
  token: string;

}

export class JwtDto {

  @Expose()
  @Type(() => UserDto)
  user: UserDto;

  @Expose()
  accessToken: string;

  @Expose()
  refreshToken: string;

  @Transform(TransformUtils.dateToTime)
  atExp: Date;

  @Transform(TransformUtils.dateToTime)
  rtExp: Date;

}

export type AuthModuleOptions = {
  service: Class<AuthService>
};
