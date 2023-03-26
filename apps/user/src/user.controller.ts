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

import { Controller } from "@nestjs/common";
import { UserService } from "./user.service";
import { MessagePattern } from "@nestjs/microservices";
import { User } from "@user/src/user.types";

@Controller()
export class UserController {

  constructor(
    private readonly userService: UserService) {
  }

  @MessagePattern("user.create")
  async create(user: User) {
    return await this.userService.create(user);
  }

  @MessagePattern("user.find.by.login")
  async findByLogin(login: string) {
    return await this.userService.findByLogin(login);
  }

}
