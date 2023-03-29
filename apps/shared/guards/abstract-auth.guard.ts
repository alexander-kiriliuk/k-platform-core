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

import { CanActivate, ExecutionContext } from "@nestjs/common";
import { JWT, REQUEST_PROPS } from "@shared/constants";
import { MsClient } from "@shared/client-proxy/ms-client";
import { User } from "@user/src/user.types";
import { CacheService } from "@shared/modules/cache/cache.types";

export abstract class AbstractAuthGuard implements CanActivate {

  protected abstract readonly cacheService: CacheService;
  protected abstract readonly msClient: MsClient;
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
      req[REQUEST_PROPS.accessToken] = token;
    } else {
      return false;
    }
    if (this.fetchUser) {
      req[REQUEST_PROPS.currentUser] = await this.msClient.dispatch<User, string>("user.find.by.login", userIdentity);
    }
    return true;
  }

  private async validateToken(token: string) {
    return this.cacheService.get(`${JWT.redisPrefix}:${JWT.accessTokenPrefix}:${token}`);
  }

}
