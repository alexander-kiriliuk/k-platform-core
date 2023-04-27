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
import { XmlDataBridgeService } from "@xml-data-bridge/src/xml-data-bridge.service";
import { MessagePattern } from "@nestjs/microservices";
import { XdbObject, XdbRequest } from "@xml-data-bridge/src/xml-data-bridge.types";

@Controller()
export class XmlDataBridgeController {

  constructor(
    private readonly xmlDbService: XmlDataBridgeService) {
  }

  @MessagePattern("xdb.import")
  importXml(payload: XdbObject) {
    return this.xmlDbService.importXml(payload);
  }

  @MessagePattern("xdb.export")
  exportXml(payload: XdbRequest) {
    return this.xmlDbService.exportXml(payload.target, payload.id);
  }

}
