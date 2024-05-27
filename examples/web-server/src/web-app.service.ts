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

import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import {
  CategoryEntity,
  CategoryRestrictionEntity,
  CategoryService,
  LanguageEntity,
  User,
  UserRole,
  UserUtils,
} from "@k-platform/core";
import hasAccessForRoles = UserUtils.hasAccessForRoles;

@Injectable()
export class WebAppService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly categoryService: CategoryService,
  ) {}

  private get menuRestrictionRep() {
    return this.dataSource.getRepository(CategoryRestrictionEntity);
  }

  getAvailableLangs() {
    return this.dataSource.getRepository(LanguageEntity).find({
      relations: [
        "icon",
        "icon.name",
        "icon.name.lang",
        "icon.files",
        "icon.files.format",
        "icon.type",
        "icon.type.ext",
      ],
    });
  }

  async getMainMenu(user: User) {
    const restrictions = await this.menuRestrictionRep.find({
      relations: ["category", "allowFor"],
    });
    const menuTree =
      await this.categoryService.getDescendantsByCodeOfRoot("a-menu-root");
    this.validateMenu(menuTree, restrictions, user?.roles);
    return menuTree;
  }

  private validateMenu(
    menuTree: CategoryEntity,
    restrictions: CategoryRestrictionEntity[],
    roles: UserRole[],
  ) {
    for (let i = menuTree.children.length - 1; i >= 0; i--) {
      const node = menuTree.children[i];
      const res = restrictions.find((v) => v.category.code === node.code);
      if (res && !hasAccessForRoles(roles, res.allowFor)) {
        menuTree.children.splice(i, 1);
      }
      if (node.children?.length) {
        this.validateMenu(node, restrictions, roles);
      }
    }
    menuTree.children = menuTree.children.filter((node) => node != null);
  }
}
