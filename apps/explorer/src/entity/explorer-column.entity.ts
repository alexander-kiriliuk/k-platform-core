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

import { Column, Entity, Index, JoinTable, ManyToMany, ManyToOne, PrimaryColumn } from "typeorm";
import { ExplorerTargetEntity } from "./explorer-target.entity";
import { ExplorerColumn } from "../explorer.types";
import { LocalizedStringEntity } from "@locale/src/entity/localized-string.entity";


@Entity("explorer_columns")
export class ExplorerColumnEntity implements ExplorerColumn {

  @Index({ unique: true })
  @PrimaryColumn("varchar")
  id: string;

  @Index()
  @Column("varchar", { nullable: false })
  property: string;

  @ManyToMany(() => LocalizedStringEntity, { cascade: true })
  @JoinTable()
  name: LocalizedStringEntity[];

  @ManyToMany(() => LocalizedStringEntity, { cascade: true })
  @JoinTable()
  description: LocalizedStringEntity[];

  @ManyToOne(() => ExplorerTargetEntity, t => t.target)
  target: ExplorerTargetEntity;

  @Column("text", { nullable: false })
  type: string;

  @Column("boolean", { default: false })
  primary: boolean;

  @Index()
  @Column("boolean", { default: false })
  unique: boolean;

  @Column("boolean", { default: false })
  multiple: boolean;

  @Index()
  @Column("varchar", { nullable: true })
  referencedEntityName: string;

  @Index()
  @Column("varchar", { nullable: true })
  referencedTableName: string;

}

