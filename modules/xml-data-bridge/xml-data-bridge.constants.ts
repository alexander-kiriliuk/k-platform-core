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

import {
  XdbAction,
  XdbDecomposedEntity,
  XdbExportDto,
  XdbExportParams,
  XdbObject,
  XdbRowData
} from "@xml-data-bridge/xml-data-bridge.types";
import * as xml2js from "xml2js";
import { Parser } from "yargs-parser";
import { ObjectLiteral } from "typeorm";

export abstract class XdbImportService {

  abstract importXml(xml: XdbObject): Promise<boolean>;

  abstract importFromFile(fileData: Buffer): Promise<boolean>;

}

export abstract class XdbExportService {

  abstract exportXml(params: XdbExportParams): Promise<XdbExportDto>;

}

export namespace Xdb {

  export const rootToken = "@root";

  let parser: Parser & {
    parseString: (xmlData: string | Buffer, callback: (err: Error | null, result: unknown) => void) => void
  };

  export const ReadOperatorRe = /\$\{@read:([^}]*)}/;

  export function getXmlParser() {
    if (parser) {
      return parser;
    }
    parser = new xml2js.Parser({
      explicitArray: false,
      preserveChildrenOrder: true,
      explicitChildren: true
    });
    return parser;
  }

  export function parseXmlBody(body: { schema }) {
    const schema = body.schema;
    const actions = schema.$$;
    const result: XdbObject = {
      schema: []
    };
    for (const action of actions) {
      const tagName = action["#name"];
      const target = action?.$?.target;
      const read = action?.$?.read;
      const rows = action.$$ ?? [];
      const obj: XdbAction = {
        action: tagName,
        attrs: { target, read },
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
    return result;
  }

  export async function parseXmlFile(xmlData: Buffer): Promise<XdbObject> {
    return new Promise((resolve, reject) => {
      getXmlParser().parseString(xmlData, async (err, result) => {
        if (err) {
          reject(err);
        } else {
          const body = parseXmlBody(result as { schema });
          resolve(body);
        }
      });
    });
  }

  export function removeDuplicateObjects(array: XdbDecomposedEntity[]): XdbDecomposedEntity[] {
    const uniqueObjects: XdbDecomposedEntity[] = [];
    array.reverse().forEach((obj) => {
      if (!uniqueObjects.some((uniqueObj) => deepEqual(uniqueObj, obj))) {
        uniqueObjects.push(obj);
      }
    });
    return uniqueObjects.reverse();
  }

  function deepEqual(obj1: ObjectLiteral, obj2: ObjectLiteral): boolean {
    if (obj1 === obj2) {
      return true;
    }
    if (typeof obj1 !== "object" || typeof obj2 !== "object" || obj1 === null || obj2 === null) {
      return false;
    }
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) {
      return false;
    }
    for (const key of keys1) {
      if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
        return false;
      }
    }
    return true;
  }

}
