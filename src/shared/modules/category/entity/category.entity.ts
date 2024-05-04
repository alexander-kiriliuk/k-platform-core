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
  PrimaryGeneratedColumn,
  Tree,
  TreeChildren,
  TreeParent
} from "typeorm";
import { LocalizedStringEntity } from "../../locale/entity/localized-string.entity";
import { SimpleJsonTransformer } from "../../../transformers/simple-json.transformer";
import { MediaEntity } from "../../../../common/media/entity/media.entity";

@Entity("categories")
@Tree("nested-set")
export class CategoryEntity {
  @PrimaryGeneratedColumn({ zerofill: true })
  id: number;

  @Index({ unique: true })
  @Column("varchar", { nullable: true })
  code: string;

  @Column("varchar", { nullable: true })
  url: string;

  @ManyToMany(() => LocalizedStringEntity, { cascade: true })
  @JoinTable()
  name: LocalizedStringEntity[];

  @Column("simple-json", {
    transformer: SimpleJsonTransformer,
    nullable: true,
    default: null
  })
  params: object;

  @ManyToOne(() => MediaEntity, (t) => t.code)
  icon: MediaEntity;

  @Index()
  @Column("int", { default: 0, unsigned: true })
  priority: number;

  @TreeParent()
  parent: CategoryEntity;

  @TreeChildren()
  children: CategoryEntity[];
}
