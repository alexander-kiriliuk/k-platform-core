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

import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { RedisService } from "@liaoliaots/nestjs-redis";
import { JWT } from "@shared/constants";

@Injectable()
export class RedisAuthGuard implements CanActivate {

  constructor(
    private readonly redisService: RedisService) {
  }

  private get redisClient() {
    return this.redisService.getClient();
  }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    if (!request.headers?.authorization) {
      return false;
    }
    const authorizationHeader = request.headers.authorization;
    const parts = authorizationHeader.match(/Bearer\s+(\S+)\s*(.+)?/);
    if (!parts.length) {
      return false;
    }
    return this.validateToken(parts[1]);
  }

  private async validateToken(token: string) {
    const userData = await this.redisClient.get(`${JWT.redisPrefix}:${JWT.redisTokenPrefix}:${token}`);
    return userData !== null;
  }

}
