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
import { ExplorerTab } from "../explorer.types";
import { LocalizedStringEntity } from "../../../shared/modules/locale/entity/localized-string.entity";
import { SimpleJsonTransformer } from "../../../shared/transformers/simple-json.transformer";
import { ExplorerTargetEntity } from "./explorer-target.entity";

@Entity("explorer_tabs")
export class ExplorerTabEntity implements ExplorerTab {

  @Index({ unique: true })
  @PrimaryColumn("varchar")
  id: string;

  @ManyToMany(() => LocalizedStringEntity, { cascade: true })
  @JoinTable()
  name: LocalizedStringEntity[];

  @Index()
  @Column("int", { default: 0, unsigned: true })
  priority: number;

  @Column("simple-json", { transformer: SimpleJsonTransformer, nullable: true, default: null })
  size: object;

  @ManyToOne(() => ExplorerTargetEntity, t => t.target)
  target: ExplorerTargetEntity;

}

