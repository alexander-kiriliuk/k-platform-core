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
import * as xml2js from "xml2js";
import { XdbActions, XdbObject, XdbRowData } from "./xml-data-bridge.types";

@Injectable()
export class XmlDataBridgeMiddleware implements NestMiddleware {

  async use(req: Request, res: Response, next: NextFunction) {
    if (req.headers["content-type"] === "application/xml") {
      const parser = new xml2js.Parser({
        explicitArray: false,
        preserveChildrenOrder: true,
        explicitChildren: true
      });
      req.body = await this.parseXML(parser, req);
      const schema = req.body.schema;
      const actions = schema.$$;
      const result: XdbObject = {
        schema: []
      };
      for (const action of actions) {
        const tagName = action["#name"];
        const target = action?.$?.target;
        const rows = action.$$;
        const obj: XdbActions = {
          action: tagName,
          attrs: { target },
          rows: []
        };
        for (const row of rows) {
          const rowObj: XdbRowData = {};
          for (const item of row.$$) {
            const itemName = item["#name"];
            if (item.$) {
              rowObj[itemName] = {
                attrs: item.$,
                value: item._
              };

              if (item.$.key && item.$$) {
                rowObj[itemName].values = item.$$.map(r => r._);
              }
            } else {
              rowObj[itemName] = item._;
            }
          }
          obj.rows.push(rowObj);
        }
        result.schema.push(obj);
      }
      req.body = result;
    }
    next();
  }

  private parseXML(parser, req): Promise<object> {
    return new Promise((resolve, reject) => {
      let xmlData = "";
      req.on("data", (chunk) => {
        xmlData += chunk;
      });
      req.on("end", () => {
        parser.parseString(xmlData, (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      });
    });
  }

}
