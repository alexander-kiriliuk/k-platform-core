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

import { FindOneOptions, FindOptionsWhere, Repository } from "typeorm";
import { MessageBus, MsDependencyOptions, MsDependencyParams } from "@shared/modules/ms-client/ms-client.types";
import { Logger } from "@nestjs/common";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { MsDependencyMetadataKey } from "@shared/modules/ms-client/ms-client.constants";
import { FindManyOptions } from "typeorm/find-options/FindManyOptions";

export class MsRepository<Entity, EnrichEntity> {

  constructor(
    readonly originalRep: Repository<Entity>,
    private readonly logger: Logger,
    private readonly bus: MessageBus) {
  }

  async findOne(options: FindOneOptions<Entity>): Promise<EnrichEntity> {
    const data = await this.originalRep.findOne(options);
    if (!data) {
      return null;
    }
    const output = await this.enrichEntities([data]);
    return output.length ? output[0] : null;
  }

  async find(options?: FindManyOptions<Entity>): Promise<EnrichEntity[]> {
    const data = await this.originalRep.find(options);
    if (!data) {
      return null;
    }
    return this.enrichEntities(data);
  }

  async findBy(options: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[]): Promise<EnrichEntity[]> {
    const data = await this.originalRep.findBy(options);
    if (!data) {
      return null;
    }
    return this.enrichEntities(data);
  }

  async create(data: EnrichEntity) {
    const entity = {} as Entity;
    const options: MsDependencyOptions<Entity> = Reflect.getMetadata(MsDependencyMetadataKey, this.originalRep.target);
    for (const key of Object.keys(data)) {
      if (options[key]) {
        const params = options[key] as MsDependencyParams;
        entity[key] = data[key][params.key];
        if (params.create) {
          await this.bus.dispatch(params.create, data[key], { timeout: params.timeout });
        }
      } else {
        entity[key] = data[key];
      }
    }
    const newEntity = this.originalRep.create(entity);
    return await this.originalRep.save(newEntity);
  }

  async update(id: string, data: EnrichEntity) {
    const entity = {} as QueryDeepPartialEntity<Entity>;
    const options: MsDependencyOptions<Entity> = Reflect.getMetadata(MsDependencyMetadataKey, this.originalRep.target);
    for (const key of Object.keys(data)) {
      if (options[key]) {
        const params = options[key] as MsDependencyParams;
        if (params.update) {
          const res = await this.bus.dispatch(params.update, data[key], { timeout: params.timeout });
          if (!res) {
            this.logger.warn(`Can't save ref to object, because MS returned empty response for command: ${params.update}`);
          } else {
            if (Array.isArray(res)) {
              const result = [];
              res.forEach(v => result.push(v[params.key]));
              entity[key] = result;
            } else {
              entity[key] = res[params.key];
            }
          }
        }
      } else {
        entity[key] = data[key];
      }
    }
    await this.originalRep.update(id, entity);
  }

  async remove(data: EnrichEntity) {
    const entity = {} as Entity;
    const options: MsDependencyOptions<Entity> = Reflect.getMetadata(MsDependencyMetadataKey, this.originalRep.target);
    for (const key of Object.keys(data)) {
      if (options[key]) {
        const params = options[key] as MsDependencyParams;
        entity[key] = data[key][params.key];
        if (params.delete) {
          await this.bus.dispatch(params.delete, data[key][params.key], { timeout: params.timeout });
        }
      } else {
        entity[key] = data[key];
      }
    }
    await this.originalRep.remove(entity);
  }

  private async enrichEntities(entities: Entity[], target = this.originalRep.target) {
    const output: EnrichEntity[] = [];
    for (const entity of entities) {
      const enrichedEntity = await this.enrichEntity(entity, target);
      output.push(enrichedEntity);
    }
    return output;
  }

  private async enrichEntity(entity: Entity, target = this.originalRep.target): Promise<EnrichEntity> {
    const options: MsDependencyOptions<Entity> = Reflect.getMetadata(MsDependencyMetadataKey, target);
    const enrichEntity = {} as EnrichEntity;
    Object.assign(enrichEntity, entity);
    if (options) {
      const enrichmentPromises = Object.keys(options).map(async (key) => {
        const params = options[key] as MsDependencyParams;
        const value = enrichEntity[key];
        const command = params.read;
        try {
          enrichEntity[key] = value ? await this.bus.dispatch(command, value, { timeout: params.timeout }) : null;
        } catch (e) {
          this.logger.warn(e);
          enrichEntity[key] = null;
        }
      });
      await Promise.all(enrichmentPromises);
    }
    const promises = Object.keys(enrichEntity).map(async (key) => {
      const field: Entity | Entity[] = enrichEntity[key];
      if (field) {
        if (typeof field === "object") {
          if (Array.isArray(field)) {
            if (field.length > 0) {
              enrichEntity[key] = await this.enrichEntities(field, field[0].constructor);
            }
          } else {
            enrichEntity[key] = await this.enrichEntity(field, field.constructor);
          }
        }
      }
    });
    await Promise.all(promises);
    return enrichEntity;
  }

}
