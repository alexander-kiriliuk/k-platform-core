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

import { DataSource, EntitySubscriberInterface, EventSubscriber, RemoveEvent } from "typeorm";
import { LocalizedStringEntity } from "@shared/modules/locale/entity/localized-string.entity";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { LOGGER } from "@shared/modules/log/log.constants";
import { InjectDataSource } from "@nestjs/typeorm";

@Injectable()
@EventSubscriber()
export class LocaleSubscriber implements EntitySubscriberInterface {
  constructor(
    @Inject(LOGGER) protected readonly logger: Logger,
    @InjectDataSource() private readonly dataSource: DataSource) {
    dataSource.manager.connection.subscribers.push(this);
  }

  async afterRemove(event: RemoveEvent<any>): Promise<void> {
    const entity = event.entity;
    if (!entity) {
      return;
    }
    const localizedStringProperties = Object.values(entity).filter(value => {
      return (
        Array.isArray(value) &&
        value.length > 0 &&
        value[0] instanceof LocalizedStringEntity
      );
    });
    if (localizedStringProperties.length > 0) {
      this.logger.verbose(`Removing related LocalizedStringEntity entities for ${entity.constructor.name} with ID ${event.entityId}`);
      for (const relatedEntities of localizedStringProperties as LocalizedStringEntity[][]) {
        for (const relatedEntity of relatedEntities) {
          this.logger.verbose(`Removing LocalizedStringEntity with ID ${relatedEntity.id}`);
          await event.manager.remove(relatedEntity);
          this.logger.verbose(`LocalizedStringEntity with ID ${relatedEntity.id} removed`);
        }
      }
    }
  }
}
