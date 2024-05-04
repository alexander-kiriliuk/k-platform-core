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

import { BadRequestException } from "@nestjs/common";
import { InsertEvent } from "typeorm/subscriber/event/InsertEvent";
import { UpdateEvent } from "typeorm";
import * as bcrypt from "bcrypt";
import { Type } from "@nestjs/common/interfaces/type.interface";
import { UserEntity } from "./entity/user.entity";

export abstract class AbstractUserSubscriber<T extends UserEntity> {
  protected abstract readonly type: Type<T>;

  protected async validateLogin(login: string) {
    const loginRegex = /^[A-Za-z0-9_]+$/;
    if (!loginRegex.test(login)) {
      throw new BadRequestException(
        "Login must contain only Latin letters, numbers, and underscores."
      );
    }
  }

  protected async hashPasswordIfNeeded(event: InsertEvent<T> | UpdateEvent<T>) {
    const { entity: user, manager } = event;
    if (typeof user.password === "number") {
      user.password = user.password.toString();
    }
    if (!user.password?.length) {
      delete user.password;
      return;
    }
    const foundUser: T = await manager.findOne(this.type, {
      where: { id: user.id }
    });
    if (foundUser) {
      if (await bcrypt.compare(user.password, foundUser.password)) {
        user.password = foundUser.password;
      } else {
        user.password = await this.hashPassword(user.password);
      }
    } else {
      user.password = await this.hashPassword(user.password);
    }
  }

  protected async hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
  }
}
