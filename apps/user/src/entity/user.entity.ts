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

import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { UserRoleEntity } from "./user-role.entity";
import { MediaEntity } from "@media/src/entity/media.entity";
import { User } from "../user";

@Entity("users")
export class UserEntity implements User {

  @PrimaryGeneratedColumn() id: string;

  @ManyToOne(t => MediaEntity, t => t.code)
  avatar: MediaEntity;

  @Column("varchar", { nullable: false })
  password: string;

  @Column("varchar", { nullable: false, unique: true })
  login: string;

  @Column("varchar", { nullable: true, unique: true })
  email: string;

  @Column("varchar", { nullable: true })
  phone: string;

  @Column("varchar", { name: "first_name", nullable: true })
  firstName: string;

  @Column("varchar", { name: "last_name", nullable: true })
  lastName: string;

  @Index()
  @Column("boolean", { default: false })
  active: boolean;

  @ManyToMany(t => UserRoleEntity)
  @JoinTable() roles: UserRoleEntity[];

  @Index()
  @CreateDateColumn({ name: "ts_created", type: "timestamp" })
  tsCreated: Date;

  get fullName() {
    if (this.firstName && this.lastName) {
      return `${this.firstName} ${this.lastName}`;
    }
    return this.login;
  }

}
