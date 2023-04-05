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
import { User, UserUpdateRequest } from "@user/src/user.types";


@Controller()
export class UserController {

  constructor(
    private readonly userService: UserService) {
  }

  @MessagePattern("user.find.by.login")
  async findUserByLogin(login: string) {
    return await this.userService.findByLogin(login);
  }

  @MessagePattern("user.find.by.id")
  async findUserById(id: string) {
    return await this.userService.findById(id);
  }

  @MessagePattern("user.update")
  async updateUser(request: UserUpdateRequest) {
    return await this.userService.updateById(request.id, request.user);
  }

  @MessagePattern("user.create")
  async createUser(user: User) {
    return await this.userService.create(user);
  }

  @MessagePattern("user.remove.by.id")
  async removeUser(id: string) {
    return await this.userService.removeById(id);
  }

}
