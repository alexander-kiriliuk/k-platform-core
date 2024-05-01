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


import { UserRole } from "../../common/user/user.types";
import { Roles } from "../constants";

export namespace UserUtils {

  export function hasAccessForRoles(userRoles: UserRole[], allowedRoles: UserRole[]) {
    if (!allowedRoles?.length || userRoles.find(v => v.code === Roles.ROOT)) {
      return true;
    }
    let allowed = false;
    for (const role of allowedRoles) {
      const existedRole = userRoles.find(v => v.code === role.code);
      if (existedRole) {
        allowed = true;
        break;
      }
    }
    return allowed;
  }

  export function hasSomeRole(userRoles: UserRole[], ...roles: string[]) {
    if (!userRoles?.length) {
      return false;
    }
    if (userRoles.find(v => v.code === Roles.ROOT)) {
      return true;
    }
    for (const role of roles) {
      if (userRoles.find(v => v.code === role)) {
        return true;
      }
    }
    return false;
  }

}
