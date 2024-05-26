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

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { LanguageEntity } from "./entity/language.entity";
import { LocalizedStringEntity } from "./entity/localized-string.entity";
import { LocalizedMediaEntity } from "./entity/localized-media.entity";

@Injectable()
export class LocaleService {
  constructor(
    @InjectRepository(LanguageEntity)
    private readonly languageRep: Repository<LanguageEntity>,
    @InjectRepository(LocalizedStringEntity)
    private readonly localizedStringRep: Repository<LocalizedStringEntity>,
    @InjectRepository(LocalizedMediaEntity)
    private readonly localizedMediaRep: Repository<LocalizedMediaEntity>,
  ) {}

  async createLocalizedStrings(
    value: string,
    code?: string,
  ): Promise<LocalizedStringEntity[]> {
    const languages = await this.languageRep.find();
    const res: LocalizedStringEntity[] = [];
    for (const language of languages) {
      const ls = new LocalizedStringEntity();
      ls.lang = language;
      ls.value = value;
      if (code) {
        ls.code = `${code}_${language.id}`;
        const existed = await this.localizedStringRep.findOne({
          where: { code: ls.code },
        });
        ls.id = existed?.id;
      }
      await this.localizedStringRep.save(ls);
      res.push(ls);
    }
    return res;
  }
}
