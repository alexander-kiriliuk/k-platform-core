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
  TableInheritance,
} from "typeorm";
import { UserRoleEntity } from "./user-role.entity";
import { User } from "../user.types";
import { MediaEntity } from "../../media/entity/media.entity";

/**
 * The entity stores the users of the system
 */
@Entity("users")
@TableInheritance({
  column: { type: "varchar", name: "class", nullable: true },
})
export class UserEntity implements User {
  @PrimaryGeneratedColumn()
  id: string;

  @ManyToOne(() => MediaEntity, (t) => t.code)
  avatar: MediaEntity;

  @Column("varchar", { nullable: false })
  password: string;

  @Column("varchar", { nullable: false, unique: true })
  login: string;

  @Index({ unique: true })
  @Column("varchar", { nullable: true })
  email: string;

  @Index()
  @Column("varchar", { nullable: true })
  phone: string;

  @Index()
  @Column("varchar", { name: "first_name", nullable: true })
  firstName: string;

  @Index()
  @Column("varchar", { name: "last_name", nullable: true })
  lastName: string;

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
