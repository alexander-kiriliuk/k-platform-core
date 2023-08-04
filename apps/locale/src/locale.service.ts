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

import { Inject, Injectable } from "@nestjs/common";
import { DataSource, In } from "typeorm";
import { LanguageEntity } from "./entity/language.entity";
import { LocalizedStringEntity } from "./entity/localized-string.entity";
import { LocalizedMediaEntity } from "./entity/localized-media.entity";
import {
  LANG_REPOSITORY,
  LOCALE_DATA_SRC,
  LOCALIZED_MEDIA_REPOSITORY,
  LOCALIZED_STRING_REPOSITORY
} from "@locale/src/locale.constants";
import { MsRepository } from "@shared/modules/ms-client/ms-repository";
import { Language, LocalizedMedia, LocalizedString } from "@locale/src/locale.types";

@Injectable()
export class LocaleService {
  constructor(
    @Inject(LOCALE_DATA_SRC) private readonly dataSource: DataSource,
    @Inject(LANG_REPOSITORY)
    private readonly languageRep: MsRepository<LanguageEntity, Language>,
    @Inject(LOCALIZED_STRING_REPOSITORY)
    private readonly localizedStringRep: MsRepository<LocalizedStringEntity, LocalizedString>,
    @Inject(LOCALIZED_MEDIA_REPOSITORY)
    private readonly localizedMediaRep: MsRepository<LocalizedMediaEntity, LocalizedMedia>) {
  }

  async getStringLocaleList(ids: string[]) {
    return await this.localizedStringRep.find({ where: { id: In(ids) }, relations: ["lang"] });
  }

  async upsertStringLocaleList(payload: LocalizedString[]) {
    // todo
    console.log("upsertStringLocaleList", payload);
    return Promise.resolve([{ id: 11 }, { id: 12 }]);
  }

  async createLocalizedStrings(value: string, code?: string): Promise<LocalizedStringEntity[]> {
    /*const languages = await this.languageRep.find();
    const res: LocalizedStringEntity[] = [];
    for (const language of languages) {
      const ls = new LocalizedStringEntity();
      ls.lang = language;
      ls.value = value;
      if (code) {
        ls.code = `${code}_${language.id}`;
        const existed = await this.localizedStringRep.findOne({ where: { code: ls.code } });
        ls.id = existed?.id;
      }
      await this.localizedStringRep.save(ls);
      res.push(ls);
    }
    return res;*/
    return null;
  }

}
