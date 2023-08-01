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

import { Media } from "@media/src/media.types";
import { LocalizedString } from "@shared/modules/locale/locale.types";
import { Exclude, Expose, Type } from "class-transformer";
import { LocalizedStringEntity } from "@shared/modules/locale/entity/localized-string.entity";

export interface User {
  id: string;
  avatar: Media;
  password: string;
  login: string;
  email: string;
  phone: string;
  firstName: LocalizedStringEntity[];
  lastName: LocalizedStringEntity[];
  active: boolean;
  roles: UserRole[];
  tsCreated: Date;
}

export interface UserRole {
  code: string;
  name: LocalizedString[];
  tsCreated: Date;
}

export interface UserUpdateRequest {
  id: string;
  user: User;
}

export interface IUserEntity extends Omit<User, "avatar" | "firstName" | "lastName" | "roles"> {
  avatar: string;
  firstName: number[];
  lastName: number[];
  roles: IUserRoleEntity[];
}

export interface IUserRoleEntity extends Omit<UserRole, "name"> {
  name: number[];
}

export class UserRoleDto implements UserRole {

  @Expose()
  code: string;

  @Expose()
  name: LocalizedString[];

  @Exclude()
  tsCreated: Date;

}

export class UserDto implements User {

  @Expose()
  id: string;

  @Expose()
  login: string;

  @Expose()
  email: string;

  @Expose()
  firstName: LocalizedStringEntity[];

  @Expose()
  lastName: LocalizedStringEntity[];

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
