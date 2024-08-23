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

import { Injectable, NotFoundException } from "@nestjs/common";
import { User, UserService } from "./user.types";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserEntity } from "./entity/user.entity";
import { USER_RELATIONS } from "./user.constants";

/**
 * Provides methods to interact with the UserEntity repository.
 */
@Injectable()
export class BasicUserService extends UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRep: Repository<UserEntity>,
  ) {
    super();
  }

  /**
   * Find a user by their login.
   * @async
   * @param {string} login - The user's login.
   * @returns {Promise<UserEntity | undefined>} The user found or undefined if not found.
   */
  async findByLogin(login: string): Promise<UserEntity> {
    return await this.userRep.findOne({
      where: { login, active: true },
      relations: USER_RELATIONS,
    });
  }

  /**
   * Find a user by their ID.
   * @async
   * @param {string} id - The user's ID.
   * @returns {Promise<UserEntity | undefined>} The user found or undefined if not found.
   */
  async findById(id: string): Promise<UserEntity> {
    return await this.userRep.findOne({
      where: { id },
      relations: USER_RELATIONS,
    });
  }

  /**
   * Update a user by their ID.
   * @async
   * @param {string} id - The user's ID.
   * @param {User} user - The user object with updated properties.
   * @returns {Promise<UserEntity>} The updated user.
   */
  async updateById(id: string, user: User): Promise<UserEntity> {
    user.id = id;
    if (user.login) {
      delete user.login;
    }
    await this.userRep.save(user);
    return await this.findById(id);
  }

  /**
   * Create a new user.
   * @async
   * @param {User} user - The user object to create.
   * @returns {Promise<UserEntity>} The created user.
   */
  async create(user: User): Promise<UserEntity> {
    const newUser = this.userRep.create(user);
    return await this.userRep.save(newUser);
  }

  /**
   * Remove a user by their ID.
   * @async
   * @param {string} id - The user's ID.
   * @returns {Promise<UserEntity>} The removed user.
   * @throws {NotFoundException} If the user with the specified ID is not found.
   */
  async removeById(id: string): Promise<UserEntity> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    await this.userRep.remove(user);
    return user;
  }
}
