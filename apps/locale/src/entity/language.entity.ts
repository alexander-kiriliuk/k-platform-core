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

import { Column, Entity, Index, PrimaryColumn } from "typeorm";
import { ILanguageEntity } from "../locale.types";
import { MsDependencies } from "@shared/modules/ms-client/ms-dependencies.decorator";


@MsDependencies<LanguageEntity>({
  icon: {
    read: "media.get.by.id",
    delete: "media.remove"
  }
})
@Entity("languages")
export class LanguageEntity implements ILanguageEntity {

  @Index({ unique: true })
  @PrimaryColumn("varchar")
  id: string;

  @Index({ unique: true })
  @Column("varchar", { nullable: true })
  code: string;

  @Index()
  @Column("varchar", { nullable: false })
  name: string;

  @Column("varchar", { nullable: true })
  icon: string;

}
