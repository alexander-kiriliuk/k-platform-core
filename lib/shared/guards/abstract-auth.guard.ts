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
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from "@nestjs/common";
import {
  ACCESS_TOKEN_ERROR_MSG,
  AUTH_ACCESS_TOKEN_PREFIX,
  AUTH_JWT_CACHE_PREFIX,
} from "../../common/auth/auth.constants";
import { Request } from "express";
import { CacheService } from "../modules/cache/cache.types";
import { UserService } from "../../common/user/user.types";
import { REQUEST_PROPS } from "../constants";

/**
 * An abstract class for creating authentication guards.
 */
export abstract class AbstractAuthGuard implements CanActivate {
  protected abstract readonly logger: Logger;
  protected abstract readonly cacheService: CacheService;
  protected abstract readonly userService: UserService;
  protected fetchUser = true;

  /**
   * Determines whether the current request is allowed to proceed based on the presence and validity of an access token.
   * @param context - The execution context of the request.
   * @returns A boolean indicating whether the request is allowed to proceed.
   */
  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const token = this.getAccessTokenFromRequest(req);
    const userIdentity = await this.validateToken(token);
    if (userIdentity) {
      req[REQUEST_PROPS.accessToken] = token;
    } else {
      this.logger.warn(`Invalid token: ${token}`);
      throw new ForbiddenException(ACCESS_TOKEN_ERROR_MSG);
    }
    if (this.fetchUser) {
      const user = await this.userService.findByLogin(userIdentity);
      if (!user) {
        throw new ForbiddenException(ACCESS_TOKEN_ERROR_MSG);
      }
      req[REQUEST_PROPS.currentUser] = user;
    }
    return true;
  }

  /**
   * Validates the given access token by checking it against the store.
   * @param token - The access token to validate.
   * @returns The user identity if the token is valid, otherwise null.
   */
  private async validateToken(token: string) {
    return this.cacheService.get(
      `${AUTH_JWT_CACHE_PREFIX}:${AUTH_ACCESS_TOKEN_PREFIX}:${token}`,
    );
  }

  /**
   * Extracts the access token from the request.
   * @param req - The request object.
   * @returns The access token if found, otherwise null.
   */
  private getAccessTokenFromRequest(req: Request) {
    if (req.cookies?.accessToken) {
      return req.cookies.accessToken;
    }
    if (req.headers?.authorization) {
      const authorizationHeader = req.headers.authorization;
      const parts = authorizationHeader.match(/Bearer\s+(\S+)\s*(.+)?/);
      if (!parts.length) {
        return null;
      }
      return parts[1];
    }
    return null;
  }
}
