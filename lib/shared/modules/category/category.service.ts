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
import { InjectRepository } from "@nestjs/typeorm";
import { TreeRepository } from "typeorm";
import { CategoryEntity } from "./entity/category.entity";
import { LOGGER } from "../log/log.constants";
import { CATEGORY_RELATIONS } from "./category.constants";
import { ObjectUtils } from "../../utils/object.utils";

/**
 * Service for working with tree-categories.
 */
@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly catRep: TreeRepository<CategoryEntity>,
    @Inject(LOGGER) private readonly logger: Logger,
  ) {}

  /**
   * Get descendants of a category by its code.
   * @param code The code of the root category.
   * @param depth The maximum depth for the search (optional).
   * @returns A promise that resolves to the tree of descendants of the category.
   */
  async getDescendantsByCodeOfRoot(code: string, depth?: number) {
    const cat = await this.catRep.findOne({
      where: { code },
      relations: CATEGORY_RELATIONS,
    });
    if (!cat) {
      return null;
    }
    const res = await this.catRep.findDescendantsTree(cat, {
      depth,
      relations: CATEGORY_RELATIONS,
    });
    if (!res.children?.length) {
      return res;
    }
    res.children.forEach((cat) => this.sort(cat));
    this.sort(res);
    return res;
  }

  /**
   * Sorts the children of a category by priority.
   * @param cat - The category entity whose children need to be sorted.
   */
  private sort(cat: CategoryEntity) {
    ObjectUtils.sort<CategoryEntity>(cat.children, "priority", false);
  }
}
