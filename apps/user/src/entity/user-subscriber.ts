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

import { EntitySubscriberInterface, EventSubscriber, UpdateEvent } from "typeorm";
import { UserEntity } from "./user.entity";
import * as bcrypt from "bcrypt";
import { InsertEvent } from "typeorm/subscriber/event/InsertEvent";
import { AuthConfig } from "@auth/gen-src/auth.config";

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<UserEntity> {

  listenTo() {
    return UserEntity;
  }

  async beforeInsert(event: InsertEvent<UserEntity>) {
    await this.hashPasswordIfNeeded(event);
  }

  async beforeUpdate(event: UpdateEvent<UserEntity>) {
    await this.hashPasswordIfNeeded(event);
  }

  private async hashPasswordIfNeeded(event: InsertEvent<UserEntity> | UpdateEvent<UserEntity>) {
    const { entity: user, manager } = event;
    if (typeof user.password === "number") {
      user.password = user.password.toString();
    }
    if (!user.password?.length) {
      return;
    }
    const foundUser: UserEntity = await manager.findOne(UserEntity, { where: { id: user.id } });
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

  private async hashPassword(password: string) {
    return await bcrypt.hash(password, AuthConfig.PWD_SALT_RANGE);
  }

}
