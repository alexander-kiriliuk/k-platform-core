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

import { ObjectLiteral } from "typeorm";
import { Media } from "../media/media.types";
import { File } from "../file/file.types";
import { XdbDecomposedEntity } from "./xml-data-bridge.types";
import { Xdb } from "./xml-data-bridge.constants";

export namespace XmlDataBridgeFileSchema {
  export const BODY_TOKEN = `%%%body%%%`;

  export function xmlFileSchemaTpl() {
    let data = `<?xml version="1.0" encoding="UTF-8"?>\n\n`;
    data += `<schema>\n`;
    data += BODY_TOKEN;
    data += `\n</schema>`;
    return data;
  }

  export function xmlMediaNodeTpl(obj: ObjectLiteral) {
    const media = obj as Media & { file: string; type: string; name: string[] };
    let data = `\n\t<Media>\n\t\t<row>\n`;
    if (media.code) {
      data += `\t\t\t<code>${media.code}</code>\n`;
    }
    data += `\t\t\t<type>${media.type.split(":").pop()}</type>\n`;
    data += `\t\t\t<file>@zip:/${media.file}</file>\n`;
    if (media.name?.length) {
      data += `\t\t\t<name key="code">\n`;
      for (const row of media.name) {
        data += `\t\t\t\t<row>${row.split(":").pop()}</row>\n`;
      }
      data += `\t\t\t</name>\n`;
    }
    data += `\t\t</row>\n\t</Media>\n`;
    return data;
  }

  export function xmlFileNodeTpl(obj: ObjectLiteral) {
    const file = obj as File & {
      file: string;
      icon: string;
      preview: string;
      name: string[];
    };
    let data = `\n\t<File>\n\t\t<row>\n`;
    if (file.code) {
      data += `\t\t\t<code>${file.code}</code>\n`;
    }
    data += `\t\t\t<public>${file.public}</public>\n`;
    if (file.icon) {
      data += `\t\t\t<icon>${file.icon.split(":").pop()}</icon>\n`;
    }
    if (file.preview) {
      data += `\t\t\t<preview>${file.preview.split(":").pop()}</preview>\n`;
    }
    if (file.name?.length) {
      data += `\t\t\t<name key="code">\n`;
      for (const row of file.name) {
        data += `\t\t\t\t<row>${row.split(":").pop()}</row>\n`;
      }
      data += `\t\t\t</name>\n`;
    }
    data += `\t\t\t<file>@zip:/${file.file}</file>\n`;
    data += `\t\t</row>\n\t</File>\n`;
    return data;
  }

  export function xmlFileInsertUpdateNodeTpl(target: string) {
    let data = `\n\t<InsertUpdate target="${target}">\n`;
    data += BODY_TOKEN;
    data += `\n\t</InsertUpdate>\n`;
    return data;
  }

  export function xmlFileRowNode() {
    let data = `\t\t<row>`;
    data += BODY_TOKEN;
    data += `\n\t\t</row>`;
    return data;
  }

  export function xmlFileRowPropertyNode(
    stack: XdbDecomposedEntity[],
    key: string,
    value: unknown | unknown[],
  ) {
    let val = value as string;
    if (value instanceof Date) {
      val = value.toISOString();
    }
    if (Array.isArray(value)) {
      if (!value.length) {
        return null;
      }
      val = value[0] as string;
      if (typeof val !== "string") {
        return null;
      }
      const parts = val.split("#");
      const propValue = parts[1];
      const kParts = propValue.split(":");
      let data = `\n\t\t\t<${key} key="${kParts[0]}">`;
      for (const v of value) {
        if (!v) {
          continue;
        }
        const parts = v.split("#");
        const propValue = parts[1];
        const kParts = propValue.split(":");
        data += `\n\t\t\t\t<row>${kParts[1]}</row>`;
      }
      data += `\n\t\t\t</${key}>`;
      return data;
    } else if (
      typeof val === "string" &&
      val.startsWith(Xdb.rootToken) &&
      val.indexOf("#") !== -1
    ) {
      const parts = val.split("#");
      const propValue = parts[1];
      const kParts = propValue.split(":");
      let data = `\n\t\t\t<${key} key="${kParts[0]}">`;
      data += kParts[1];
      data += `</${key}>`;
      return data;
    }
    let data = `\n\t\t\t<${key}>`;
    data += val;
    data += `</${key}>`;
    return data;
  }
}
