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


export interface XdbRequest {
  target: string;
  id: string;
}

export type XdbRowDataValue = {
  attrs?: {
    key?: string;
    uri?: string;
  };
  value?: string;
  values?: string[];
}

export type XdbRowData = {
  [key: string]: XdbRowDataValue;
};

export type MediaRow = {
  name: XdbRowDataValue;
  code: string;
  type: string;
  file: string;
}

export type FileRow = {
  name: XdbRowDataValue;
  code: string;
  public: boolean;
  file: string;
}

export type XdbActions = {
  action: "InsertUpdate" | "Media" | "File" | "Remove";
  attrs: {
    target: string;
  };
  rows: Array<XdbRowData | FileRow>;
};

export type XdbObject = {
  schema: XdbActions[];
};