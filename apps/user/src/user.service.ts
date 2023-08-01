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

import { Inject, Injectable } from "@nestjs/common";
import { User } from "@user/src/user.types";
import { UserEntity } from "@user/src/entity/user.entity";
import { NotFoundMsException } from "@shared/exceptions/not-found-ms.exception";
import { USER_RELATIONS, USER_REPOSITORY } from "@user/src/user.constants";
import { MsRepository } from "@shared/modules/ms-client/ms-repository";

/**
 * @class UserService
 * Provides methods to interact with the UserEntity repository.
 */
@Injectable()
export class UserService {

  constructor(
    @Inject(USER_REPOSITORY) private readonly userRep: MsRepository<UserEntity, User>) {
  }

  /**
   * Find a user by their login.
   * @async
   * @param {string} login - The user's login.
   * @returns {Promise<UserEntity | undefined>} The user found or undefined if not found.
   */
  async findByLogin(login: string) {
    return await this.userRep.findOne({ where: { login }, relations: USER_RELATIONS });
  }

  /**
   * Find a user by their ID.
   * @async
   * @param {string} id - The user's ID.
   * @returns {Promise<UserEntity | undefined>} The user found or undefined if not found.
   */
  async findById(id: string) {
    return await this.userRep.findOne({ where: { id }, relations: USER_RELATIONS });
  }

  /**
   * Update a user by their ID.
   * @async
   * @param {string} id - The user's ID.
   * @param {User} user - The user object with updated properties.
   * @returns {Promise<UserEntity>} The updated user.
   */
  async updateById(id: string, user: User) {
    await this.userRep.update(id, user);
    return await this.findById(id);
  }

  /**
   * Create a new user.
   * @async
   * @param {User} user - The user object to create.
   * @returns {Promise<UserEntity>} The created user.
   */
  async create(user: User) {
    return await this.userRep.create(user);
  }

  /**
   * Remove a user by their ID.
   * @async
   * @param {string} id - The user's ID.
   * @returns {Promise<UserEntity>} The removed user.
   * @throws {NotFoundMsException} If the user with the specified ID is not found.
   */
  async removeById(id: string) {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundMsException(`User with ID ${id} not found`);
    }
    await this.userRep.remove(user);
    return user;
  }

}
