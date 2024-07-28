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
import { CacheService } from "../cache.types";
import { MockStorage } from "../../mock/mock.storage";

/**
 * A mock service class that provides cache storage functionality implementing the CacheService interface
 */
@Injectable()
export class MockCacheService implements CacheService {
  constructor(private readonly storage: MockStorage) {}

  async get(key: string): Promise<string | null> {
    return new Promise((resolve) => {
      const res = this.storage.find(key);
      resolve(res?.data as string);
    });
  }

  async getBoolean(key: string) {
    const val = await this.get(key);
    return Boolean(val);
  }

  async getNumber(key: string) {
    const val = await this.get(key);
    return +val;
  }

  async set(key: string, value: string | number, _?: number): Promise<boolean> {
    return new Promise((resolve) => {
      this.storage.set(key, value);
      resolve(true);
    });
  }

  async del(...keys: string[]): Promise<boolean> {
    return new Promise((resolve) => {
      keys.forEach((k) => this.storage.remove(k));
      resolve(true);
    });
  }

  async incr(key: string): Promise<number | null> {
    return new Promise(async (resolve) => {
      try {
        let num = await this.getNumber(key);
        num++;
        await this.set(key, num);
        resolve(num);
      } catch (e) {
        resolve(null);
      }
    });
  }

  async expire(_: string, __: number): Promise<boolean> {
    return new Promise((resolve) => resolve(true));
  }

  getFromPattern(key: string): Promise<string[]> {
    return new Promise((resolve) => {
      const res = this.storage.filter(key);
      const result = [];
      res.forEach((v) => result.push(v.key));
      return resolve(result.length ? result : undefined);
    });
  }
}
