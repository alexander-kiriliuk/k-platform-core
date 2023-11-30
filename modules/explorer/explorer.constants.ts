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

export namespace Explorer {

  export const TARGET_RELATIONS_BASIC = [
    "name", "name.lang",
    "description", "description.lang",
    "icon", "icon.name", "icon.name.lang", "icon.files", "icon.files.format", "icon.type", "icon.type.ext"
  ];

  export const TARGET_RELATIONS_FULL = [
    "name", "name.lang",
    "icon", "icon.name", "icon.name.lang", "icon.files", "icon.files.format", "icon.type", "icon.type.ext",
    "columns", "columns.name", "columns.name.lang",
    "columns.objectRenderer", "columns.objectRenderer.name", "columns.objectRenderer.name.lang",
    "columns.objectRenderer.description", "columns.objectRenderer.description.lang",
    "columns.sectionRenderer", "columns.sectionRenderer.name", "columns.sectionRenderer.name.lang",
    "columns.sectionRenderer.description", "columns.sectionRenderer.description.lang",
    "columns.tab"
  ];

  export const TARGET_RELATIONS_OBJECT = [
    "name", "name.lang",
    "icon", "icon.name", "icon.name.lang", "icon.files", "icon.files.format", "icon.type", "icon.type.ext",
    "columns", "columns.name", "columns.name.lang",
    "columns.objectRenderer", "columns.objectRenderer.name", "columns.objectRenderer.name.lang",
    "columns.objectRenderer.description", "columns.objectRenderer.description.lang",
    "columns.tab"
  ];

  export const TARGET_RELATIONS_SECTION = [
    "name", "name.lang",
    "icon", "icon.name", "icon.name.lang", "icon.files", "icon.files.format", "icon.type", "icon.type.ext",
    "columns", "columns.name", "columns.name.lang",
    "columns.sectionRenderer", "columns.sectionRenderer.name", "columns.sectionRenderer.name.lang",
    "columns.sectionRenderer.description", "columns.sectionRenderer.description.lang"
  ];

  export type RendererType = "section" | "object";

}