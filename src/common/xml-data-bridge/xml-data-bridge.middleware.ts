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

import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { Xdb } from "./xml-data-bridge.constants";

@Injectable()
export class XmlDataBridgeMiddleware implements NestMiddleware {

  private readonly parser = Xdb.getXmlParser();

  async use(req: Request, res: Response, next: NextFunction) {
    if (req.headers["content-type"] === "application/xml") {
      req.body = await this.parseXMLFromRequest(req);
      req.body = Xdb.parseXmlBody(req.body);
    }
    next();
  }

  private parseXMLFromRequest(req): Promise<object> {
    return new Promise((resolve, reject) => {
      let xmlData = "";
      req.on("data", (chunk) => {
        xmlData += chunk;
      });
      req.on("end", () => {
        this.parser.parseString(xmlData, (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result as object);
          }
        });
      });
    });
  }

}
