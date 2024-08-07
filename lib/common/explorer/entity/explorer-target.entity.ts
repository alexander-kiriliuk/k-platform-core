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
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from "typeorm";
import { ExplorerColumnEntity } from "./explorer-column.entity";
import { ExplorerAction, ExplorerTarget } from "../explorer.types";
import { LocalizedStringEntity } from "../../../shared/modules/locale/entity/localized-string.entity";
import { MediaEntity } from "../../media/entity/media.entity";
import { ExplorerActionEntity } from "./explorer-action.entity";
import { UserRoleEntity } from "../../user/entity/user-role.entity";

/**
 * The entity stores a detailed description of the entity (tables in the database) in the form of an object
 * with metadata and stores the display configuration in lists and detailed pages
 */
@Entity("explorer_targets")
export class ExplorerTargetEntity implements ExplorerTarget {
  @PrimaryColumn("varchar")
  target: string;

  @Index({ unique: true })
  @Column("varchar", { name: "table_name", nullable: false })
  tableName: string;

  @Index({ unique: true })
  @Column("varchar", { nullable: true })
  alias: string;

  @ManyToMany(() => LocalizedStringEntity, { cascade: true })
  @JoinTable()
  name: LocalizedStringEntity[];

  @ManyToMany(() => LocalizedStringEntity, { cascade: true })
  @JoinTable()
  description: LocalizedStringEntity[];

  @ManyToOne(() => MediaEntity, (t) => t.code)
  icon: MediaEntity;

  @OneToMany(() => ExplorerColumnEntity, (c) => c.target, { cascade: true })
  columns: ExplorerColumnEntity[];

  @ManyToMany(() => ExplorerActionEntity)
  @JoinTable()
  actions: ExplorerAction[];

  @Index()
  @Column("boolean", {
    name: "default_action_create",
    default: true,
    nullable: true,
  })
  defaultActionCreate: boolean;

  @Index()
  @Column("boolean", {
    name: "default_action_save",
    default: true,
    nullable: true,
  })
  defaultActionSave: boolean;

  @Index()
  @Column("boolean", {
    name: "default_action_delete",
    default: true,
    nullable: true,
  })
  defaultActionDelete: boolean;

  @Index()
  @Column("boolean", {
    name: "default_action_duplicate",
    default: true,
    nullable: true,
  })
  defaultActionDuplicate: boolean;

  @ManyToMany(() => UserRoleEntity)
  @JoinTable()
  canRead: UserRoleEntity[];

  @ManyToMany(() => UserRoleEntity)
  @JoinTable()
  canWrite: UserRoleEntity[];
}
