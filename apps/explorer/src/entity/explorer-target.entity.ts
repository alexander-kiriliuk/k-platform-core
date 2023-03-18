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

import { Column, Entity, Index, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";
import { ExplorerColumnEntity } from "./explorer-column.entity";
import { MediaEntity } from "@media/src/entity/media.entity";
import { ExplorerTarget } from "../explorer";


@Entity("explorer2_targets")
export class ExplorerTargetEntity implements ExplorerTarget {

  @PrimaryColumn("varchar")
  target: string;

  @Index({ unique: true })
  @Column("varchar", { name: "table_name", nullable: false })
  tableName: string;

  @Index()
  @Column("varchar", { nullable: false })
  name: string;

  @Column("text", { nullable: true })
  description: string;

  @ManyToOne(t => MediaEntity, t => t.code)
  icon: MediaEntity;

  @OneToMany(c => ExplorerColumnEntity, c => c.target, { cascade: true })
  columns: ExplorerColumnEntity[];

}

