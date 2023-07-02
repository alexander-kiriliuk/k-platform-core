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

import { CanActivate, ExecutionContext, Logger } from "@nestjs/common";
import { REQUEST_PROPS } from "@shared/constants";
import { User } from "@user/src/user.types";
import { CacheService } from "@shared/modules/cache/cache.types";
import { AUTH_ACCESS_TOKEN_PREFIX, AUTH_JWT_CACHE_PREFIX } from "@auth/src/auth.constants";
import { MessageBus } from "@shared/modules/ms-client/ms-client.types";

/**
 * @abstract
 * @class AbstractAuthGuard
 * An abstract class for creating authentication guards.
 */
export abstract class AbstractAuthGuard implements CanActivate {

  protected abstract readonly logger: Logger;
  protected abstract readonly cacheService: CacheService;
  protected abstract readonly bus: MessageBus;
  protected fetchUser = true;

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    if (!req.headers?.authorization) {
      return false;
    }
    const authorizationHeader = req.headers.authorization;
    const parts = authorizationHeader.match(/Bearer\s+(\S+)\s*(.+)?/);
    if (!parts.length) {
      return false;
    }
    const token = parts[1];
    const userIdentity = await this.validateToken(token);
    if (userIdentity) {
      this.logger.debug(`Valid token for user ${userIdentity}`);
      req[REQUEST_PROPS.accessToken] = token;
    } else {
      this.logger.warn(`Invalid token: ${token}`);
      return false;
    }
    if (this.fetchUser) {
      req[REQUEST_PROPS.currentUser] = await this.bus.dispatch<User, string>("user.find.by.login", userIdentity);
    }
    return true;
  }

  private async validateToken(token: string) {
    return this.cacheService.get(`${AUTH_JWT_CACHE_PREFIX}:${AUTH_ACCESS_TOKEN_PREFIX}:${token}`);
  }

}
