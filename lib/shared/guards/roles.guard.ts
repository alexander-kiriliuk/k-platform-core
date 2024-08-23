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
import { UserUtils } from "../utils/user.utils";
import { AllowedForMetadataKey } from "../decorators/for-roles.decorator";
import { UserRole } from "../../common/user/user.types";
import { REQUEST_PROPS, Roles } from "../constants";
import hasSomeRole = UserUtils.hasSomeRole;

/**
 * A guard for role-based access control.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>(
      AllowedForMetadataKey,
      context.getHandler(),
    );
    if (!roles) {
      return true;
    }
    const req = context.switchToHttp().getRequest();
    const userRoles: UserRole[] = req[REQUEST_PROPS.currentUser]?.roles || [];
    if (hasSomeRole(userRoles, Roles.ROOT)) {
      return true;
    }
    for (const role of userRoles) {
      if (roles.indexOf(role.code) !== -1) {
        return true;
      }
    }
    return false;
  }
}
