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
  PrimaryColumn,
} from "typeorm";
import { ExplorerColumnRenderer } from "../explorer.types";
import { LocalizedStringEntity } from "../../../shared/modules/locale/entity/localized-string.entity";
import { SimpleJsonTransformer } from "../../../shared/transformers/simple-json.transformer";
import { Explorer } from "../explorer.constants";

/**
 * An entity stores parameters for rendering the read/write interface of a specific column of a specific entity
 */
@Entity("explorer_column_renderers")
export class ExplorerColumnRendererEntity implements ExplorerColumnRenderer {
  @PrimaryColumn("varchar")
  code: string;

  @ManyToMany(() => LocalizedStringEntity, { cascade: true })
  @JoinTable()
  name: LocalizedStringEntity[];

  @ManyToMany(() => LocalizedStringEntity, { cascade: true })
  @JoinTable()
  description: LocalizedStringEntity[];

  @Index()
  @Column({
    type: "enum",
    enum: ["section", "object"],
    default: null,
    nullable: true,
  })
  type: Explorer.Variation;

  @Column("simple-json", {
    transformer: SimpleJsonTransformer,
    nullable: true,
    default: null,
  })
  params: object;
}
