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
import { LocalizedStringEntity } from "@shared/modules/locale/entity/localized-string.entity";
import { ExplorerColumnRendererEntity } from "@explorer/entity/explorer-column-renderer.entity";
import { SimpleJsonTransformer } from "@shared/transformer/simple-json.transformer";
import { ExplorerTabEntity } from "@explorer/entity/explorer-tab.entity";


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

  @Index()
  @Column("boolean", { default: false })
  virtual: boolean;

  @Index()
  @Column("boolean", { default: false })
  primary: boolean;

  @Index()
  @Column("boolean", { default: false })
  unique: boolean;

  @Index()
  @Column("boolean", { default: false })
  multiple: boolean;

  @Index()
  @Column("boolean", { default: false })
  named: boolean;

  @Index()
  @Column("varchar", { name: "referenced_entity_name", nullable: true })
  referencedEntityName: string;

  @Index()
  @Column("varchar", { name: "referenced_table_name", nullable: true })
  referencedTableName: string;

  @Index()
  @Column("int", { name: "section_priority", default: 0, unsigned: true })
  sectionPriority: number;

  @Index()
  @Column("int", { name: "object_priority", default: 0, unsigned: true })
  objectPriority: number;

  @Index()
  @Column("boolean", { name: "section_enabled", default: true })
  sectionEnabled: boolean;

  @Index()
  @Column("boolean", { name: "object_enabled", default: true })
  objectEnabled: boolean;

  @Index()
  @Column("boolean", { name: "section_visibility", default: true })
  sectionVisibility: boolean;

  @Index()
  @Column("boolean", { name: "object_visibility", default: true })
  objectVisibility: boolean;

  @Index()
  @ManyToOne(() => ExplorerColumnRendererEntity, t => t.code)
  sectionRenderer: ExplorerColumnRendererEntity;

  @Index()
  @ManyToOne(() => ExplorerColumnRendererEntity, t => t.code)
  objectRenderer: ExplorerColumnRendererEntity;

  @Column("simple-json", {
    transformer: SimpleJsonTransformer,
    name: "section_renderer_params",
    nullable: true,
    default: null
  })
  sectionRendererParams: object;

  @Column("simple-json", {
    transformer: SimpleJsonTransformer,
    name: "object_renderer_params",
    nullable: true,
    default: null
  })
  objectRendererParams: object;

  @ManyToOne(() => ExplorerTabEntity, t => t.id)
  tab: ExplorerTabEntity;

}

