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
import { InsertEvent } from "typeorm/subscriber/event/InsertEvent";
import { AbstractUserSubscriber } from "../abstract-user-subscriber";

@EventSubscriber()
export class UserSubscriber
  extends AbstractUserSubscriber<UserEntity>
  implements EntitySubscriberInterface<UserEntity> {
  protected readonly type = UserEntity;

  listenTo() {
    return UserEntity;
  }

  async beforeInsert(event: InsertEvent<UserEntity>) {
    await this.validateLogin(event.entity.login);
    await this.hashPasswordIfNeeded(event);
  }

  async beforeUpdate(event: UpdateEvent<UserEntity>) {
    if (event.entity.login) {
      await this.validateLogin(event.entity.login);
    }
    await this.hashPasswordIfNeeded(event);
  }
}
