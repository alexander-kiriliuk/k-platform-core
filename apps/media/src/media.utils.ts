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

import { Media } from "@media/src/media.types";
import { MediaConfig } from "@media/gen-src/media.config";
import { ReservedMediaFormat } from "@media/src/media.constants";

export namespace MediaUtils {

  import ORIGINAL = ReservedMediaFormat.ORIGINAL;

  export function getMediaPath(media: Media, format: string = ORIGINAL, webpSupport = false) {
    let mediaPath = `${media.type.private ? MediaConfig.PRIVATE_DIR : MediaConfig.PUBLIC_DIR}/${media.id}/`;
    const file = media.files.find(v => v.format.code === format);
    mediaPath += file.name;
    if (webpSupport && media.type.vp6) {
      mediaPath += ".webp";
    } else {
      mediaPath += `.${media.type.ext.code}`;
    }
    return mediaPath;
  }

}
