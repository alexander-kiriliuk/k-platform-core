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

import { Injectable } from "@nestjs/common";
import { EntitySaveHandler } from "../explorer.types";
import { User } from "../../user/user.types";
import { Roles } from "../../../shared/constants";

@Injectable()
export class UserEntityPwdAndRolesSaveHandler implements EntitySaveHandler<User> {

  handle(target: string, payload: User, currentUser: User) {
    if (!currentUser.roles.find(v => v.code === Roles.ROOT)) {
      if (payload.id) {
        delete payload.password;
        delete payload.login;
      }
      delete payload.roles;
    }
    return payload;
  }

}
