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

import { Controller } from "@nestjs/common";
import { ExplorerService } from "./explorer.service";
import { MessagePattern } from "@nestjs/microservices";
import {
  ExplorerEntityRequest,
  ExplorerPagedEntityRequest,
  ExplorerRemoveEntityRequest,
  ExplorerSaveEntityRequest,
} from "@explorer/src/explorer.types";

@Controller()
export class ExplorerController {

  constructor(
    private readonly explorerService: ExplorerService) {
  }

  @MessagePattern("explorer.entity.pageable")
  async pagedEntity(payload: ExplorerPagedEntityRequest) {
    return await this.explorerService.getPageableEntityData(payload.target, payload.params);
  }

  @MessagePattern("explorer.entity.get")
  async entity(payload: ExplorerEntityRequest) {
    return await this.explorerService.getEntityData(payload.target, payload.id);
  }

  @MessagePattern("explorer.entity.save")
  async saveEntity(payload: ExplorerSaveEntityRequest) {
    return await this.explorerService.saveEntityData(payload.target, payload.data);
  }

  @MessagePattern("explorer.entity.remove")
  async removeEntity(payload: ExplorerRemoveEntityRequest) {
    return await this.explorerService.removeEntity(payload.target, payload.id);
  }

}
