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

import { Column, CreateDateColumn, Entity, Index, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserRoleEntity } from "./user-role.entity";
import { IUserEntity } from "../user.types";
import { MsDependencies } from "@shared/modules/ms-client/ms-dependencies.decorator";

@MsDependencies<UserEntity>({
  avatar: {
    read: "media.get.by.id",
    delete: "media.remove"
  },
  firstName: {
    read: "locale.string.list.get",
    create: "locale.string.list.create",
    update: "locale.string.list.update",
    delete: "locale.string.list.delete"
  },
  lastName: {
    read: "locale.string.list.get",
    create: "locale.string.list.create",
    update: "locale.string.list.update",
    delete: "locale.string.list.delete"
  }
})
@Entity("users")
export class UserEntity implements IUserEntity {

  @PrimaryGeneratedColumn()
  id: string;

  @Column("varchar", { nullable: true })
  avatar: string;

  @Column("varchar", { nullable: false })
  password: string;

  @Column("varchar", { nullable: false, unique: true })
  login: string;

  @Column("varchar", { nullable: true, unique: true })
  email: string;

  @Column("varchar", { nullable: true })
  phone: string;

  /*  @ManyToMany(() => LocalizedStringEntity, { cascade: true })
    @JoinTable()*/
  @Column("int", { array: true, nullable: true })
  firstName: number[];

  /*@ManyToMany(() => LocalizedStringEntity, { cascade: true })
  @JoinTable()*/
  @Column("int", { array: true, nullable: true })
  lastName: number[];

  @Index()
  @Column("boolean", { default: false })
  active: boolean;

  @ManyToMany(() => UserRoleEntity)
  @JoinTable()
  roles: UserRoleEntity[];

  @Index()
  @CreateDateColumn({ name: "ts_created", type: "timestamp" })
  tsCreated: Date;

}
