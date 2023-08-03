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

import { Column, CreateDateColumn, Entity, Index, PrimaryColumn } from "typeorm";
import { IUserRoleEntity } from "@user/src/user.types";
import { MsDependencies } from "@shared/modules/ms-client/ms-dependencies.decorator";

@MsDependencies<UserRoleEntity>({
  name: {
    read: "locale.string.list.get",
    create: "locale.string.list.create",
    update: "locale.string.list.update",
    delete: "locale.string.list.delete"
  }
})
@Entity("users_roles")
export class UserRoleEntity implements IUserRoleEntity {

  @Index({ unique: true })
  @PrimaryColumn("varchar")
  code: string;

  @Column("int", { array: true, nullable: true })
  name: number[];

  @Index()
  @CreateDateColumn({ name: "ts_created", type: "timestamp" })
  tsCreated: Date;

}
