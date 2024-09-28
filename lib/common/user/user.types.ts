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

import { Exclude, Expose, Type } from "class-transformer";
import { Type as Class } from "@nestjs/common/interfaces/type.interface";
import { Media } from "../media/media.types";
import { LocalizedString } from "../../shared/modules/locale/locale.types";

/**
 * Interface representing a user object.
 */
export interface User {
  id: string;
  avatar: Media;
  password: string;
  login: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  active: boolean;
  roles: UserRole[];
  tsCreated: Date;
}

/**
 * Interface representing a user role.
 */
export interface UserRole {
  code: string;
  name: LocalizedString[];
  tsCreated: Date;
}

/**
 * Data transfer object for user role.
 */
export class UserRoleDto implements UserRole {
  @Expose()
  code: string;

  @Expose()
  name: LocalizedString[];

  @Exclude()
  tsCreated: Date;
}

/**
 * Data transfer object for user.
 */
export class UserDto implements User {
  @Expose()
  id: string;

  @Expose()
  login: string;

  @Expose()
  email: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Exclude()
  password: string;

  @Expose()
  @Type(() => UserRoleDto)
  roles: UserRoleDto[];

  @Expose()
  active: boolean;

  @Expose()
  avatar: Media;

  @Expose()
  phone: string;

  @Exclude()
  tsCreated: Date;
}

/**
 * Interface representing a request to update a user.
 */
export interface UserUpdateRequest {
  id: string;
  user: User;
}

/**
 * Abstract class representing the user service.
 */
export abstract class UserService {
  abstract findByLogin(login: string): Promise<User>;

  abstract findById(id: string): Promise<User>;

  abstract updateById(id: string, user: User): Promise<User>;

  abstract create(user: User): Promise<User>;

  abstract removeById(id: string): Promise<User>;
}

/**
 * Interface representing the basic functionality for a user profile management controller.
 */
export interface BasicUserController {
  /**
   * Retrieves the profile of a user by ID or returns the profile of the current user if no ID is provided.
   * @param id - The ID of the user profile to be retrieved. If not provided, the current user's profile is returned.
   * @param user - The current authenticated user.
   * @returns A promise that resolves to the retrieved user entity.
   */
  getUserProfile(id: string, user: User): Promise<User>;

  /**
   * Updates the profile of a user by ID or updates the profile of the current user if no ID is provided.
   * @param id - The ID of the user profile to be updated. If not provided, the current user's profile is updated.
   * @param profile - The new profile data.
   * @param user - The current authenticated user.
   * @returns A promise that resolves to the updated user entity.
   */
  updateUserProfile(id: string, profile: User, user: User): Promise<User>;

  /**
   * Removes a user profile by ID from the system.
   * @param id - The ID of the user profile to be removed.
   * @returns A promise that resolves to the removed user entity.
   */
  removeUserProfile(id: string): Promise<User>;

  /**
   * Creates a new user profile in the system.
   * @param profile - The profile data for the new user.
   * @returns A promise that resolves to the created user entity.
   */
  createUserProfile(profile: User): Promise<User>;
}

/**
 * Options for configuring the UserModule.
 */
export type UserModuleOptions = {
  service: Class<UserService>;
};
