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

import { CreateDateColumn, Entity, Index, JoinTable, ManyToMany, PrimaryColumn } from "typeorm";
import { UserRole } from "../user.types";
import { LocalizedStringEntity } from "@shared/modules/locale/entity/localized-string.entity";

@Entity("users_roles")
export class UserRoleEntity implements UserRole {

  @Index({ unique: true })
  @PrimaryColumn("varchar")
  code: string;

  @ManyToMany(() => LocalizedStringEntity, { cascade: true })
  @JoinTable()
  name: LocalizedStringEntity[];

  @Index()
  @CreateDateColumn({ name: "ts_created", type: "timestamp" })
  tsCreated: Date;

}
