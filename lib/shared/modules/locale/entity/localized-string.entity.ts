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
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { LocalizedString } from "../locale.types";
import { LanguageEntity } from "./language.entity";

/**
 * The entity stores the translations in itself
 */
@Entity("localized_strings")
export class LocalizedStringEntity implements LocalizedString {
  @PrimaryGeneratedColumn({ zerofill: true })
  id: number;

  @Index({ unique: true })
  @Column("varchar", { nullable: true })
  code: string;

  @ManyToOne(() => LanguageEntity, (t) => t.id)
  lang: LanguageEntity;

  @Column("text", { nullable: true })
  value: string;
}
