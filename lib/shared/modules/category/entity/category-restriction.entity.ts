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
} from "typeorm";
import { CategoryEntity } from "./category.entity";
import { UserRoleEntity } from "../../../../common/user/entity/user-role.entity";

/**
 * The entity stores the settings for restricting access by user roles for categories
 */
@Entity("category_restriction")
export class CategoryRestrictionEntity {
  @PrimaryGeneratedColumn({ zerofill: true })
  id: number;

  @Index({ unique: true })
  @Column("varchar", { nullable: true })
  code: string;

  @ManyToMany(() => UserRoleEntity)
  @JoinTable()
  allowFor: UserRoleEntity[];

  @ManyToOne(() => CategoryEntity, (t) => t.id)
  category: CategoryEntity;
}
