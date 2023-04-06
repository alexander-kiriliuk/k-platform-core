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
import { Reflector } from "@nestjs/core";
import { UserRole } from "@user/src/user.types";
import { REQUEST_PROPS, Role } from "@shared/constants";
import { AllowedForMetadataKey } from "@shared/decorators/for-roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {

  constructor(
    private readonly reflector: Reflector) {
  }

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>(AllowedForMetadataKey, context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const userRoles: UserRole[] = request[REQUEST_PROPS.currentUser]?.roles || [];
    if (this.hasSomeRole(userRoles, Role.ROOT)) {
      return true;
    }
    for (const role of userRoles) {
      if (roles.indexOf(role.code) !== -1) {
        return true;
      }
    }
    return false;
  }

  private hasSomeRole(userRoles: UserRole[], ...roles: string[]) {
    if (!userRoles?.length) {
      return false;
    }
    for (const role of roles) {
      if (userRoles.find(v => v.code === role)) {
        return true;
      }
    }
    return false;
  }

}
