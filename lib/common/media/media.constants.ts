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

/**
 * Default media type code.
 */
export const DEFAULT_MEDIA_TYPE = "default";

/**
 * Default media quality value.
 */
export const DEFAULT_MEDIA_QUALITY = 78;

/**
 * Namespace containing reserved media formats.
 */
export namespace ReservedMediaFormat {
  export const ORIGINAL = "original";
  export const THUMB = "thumb";
}

/**
 * Namespace containing reserved media extensions.
 */
export namespace ReservedMediaExt {
  export const SVG = "svg";
}

/**
 * Array containing relations for media type.
 */
export const MEDIA_TYPE_RELATIONS = ["ext", "formats"];

/**
 * Array containing relations for media.
 */
export const MEDIA_RELATIONS = [
  "name",
  "name.lang",
  "type",
  "type.formats",
  "type.ext",
  "files",
  "files.format",
];
