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

import { Inject, Injectable, Logger } from "@nestjs/common";
import { LOGGER } from "@shared/modules/log/log.constants";
import { LanguageEntity } from "@shared/modules/locale/entity/language.entity";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { CategoryEntity } from "@shared/modules/category/entity/category.entity";
import { CategoryService } from "@shared/modules/category/category.service";
import { WebAppMenuRestrictionEntity } from "./entity/web-app-menu-restriction.entity";
import { User, UserRole } from "@user/user.types";

@Injectable()
export class WebAppService {

  constructor(
    @Inject(LOGGER) private readonly logger: Logger,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly categoryService: CategoryService) {
  }

  private get menuRestrictionRep() {
    return this.dataSource.getRepository(WebAppMenuRestrictionEntity);
  }

  getAvailableLangs() {
    return this.dataSource.getRepository(LanguageEntity).find({
      relations: [
        "icon", "icon.name", "icon.name.lang", "icon.files", "icon.files.format", "icon.type", "icon.type.ext"
      ]
    });
  }

  async getMainMenu(user: User) {
    const restrictions = await this.menuRestrictionRep.find({ relations: ["category", "allowFor"] });
    const menuTree = await this.categoryService.getDescendantsByCodeOfRoot("a-menu-root");
    this.validateMenu(menuTree, restrictions, user.roles);
    return menuTree;
  }

  private validateMenu(menuTree: CategoryEntity, restrictions: WebAppMenuRestrictionEntity[], roles: UserRole[]) {
    for (let i = 0; i < menuTree.children.length; i++) {
      const node = menuTree.children[i];
      const res = restrictions.find(v => v.category.code === node.code);
      if (res) {
        let allowed = false;
        for (const role of res.allowFor) {
          const existedRole = roles.find(v => v.code === role.code);
          if (existedRole) {
            allowed = true;
            break;
          }
        }
        if (!allowed) {
          menuTree.children.splice(i, 1);
          continue;
        }
      }
      if (node.children?.length) {
        this.validateMenu(node, restrictions, roles);
      }
    }
  }

}
