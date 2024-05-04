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

  constructor(
    private readonly storage: MockStorage) {
  }

  /**
   * Retrieves the value of the specified key from the mock storage.
   *
   * @param key - The key to retrieve from the mock storage.
   * @returns A Promise that resolves to the value of the key or null.
   */
  async get(key: string): Promise<string | null> {
    return new Promise(resolve => {
      const res = this.storage.find(key);
      resolve(res?.data as string);
    });
  }

  /**
   * Retrieves the boolean value of the specified key from the mock storage.
   *
   * @param key - The key to retrieve from the mock storage.
   * @returns A Promise that resolves to the boolean value of the key.
   */
  async getBoolean(key: string) {
    const val = await this.get(key);
    return Boolean(val);
  }

  /**
   * Retrieves the number value of the specified key from the mock storage.
   *
   * @param key - The key to retrieve from the mock storage.
   * @returns A Promise that resolves to the number value of the key.
   */
  async getNumber(key: string) {
    const val = await this.get(key);
    return +val;
  }

  /**
   * Sets the value of the specified key in the mock storage.
   *
   * @param key - The key to set in the cache.
   * @param value - The value to set for the key.
   * @param expiresIn - Optional expiration time in seconds (not affect to anything).
   * @returns A true value always.
   */
  async set(key: string, value: string | number, expiresIn?: number): Promise<boolean> {
    return new Promise(resolve => {
      this.storage.set(key, value);
      resolve(true);
    });
  }

  /**
   * Deletes the specified keys from the mock storage.
   *
   * @param keys - The keys to delete from the mock storage.
   * @returns A true value always.
   */
  async del(...keys: string[]): Promise<boolean> {
    return new Promise(resolve => {
      keys.forEach(k => this.storage.remove(k));
      resolve(true);
    });
  }

  /**
   * Increments the value of the specified key in the mock storage.
   *
   * @param key - The key to increment.
   * @returns A Promise that resolves to the new value of the key or null if an error occurs.
   */
  async incr(key: string): Promise<number | null> {
    return new Promise(async resolve => {
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

  /**
   * Sets the expiration time for the given key in the mock storage (this method is a stub).
   * @param key - The key to set the expiration time for (not affect to anything).
   * @param expiresIn - The expiration time in seconds (not affect to anything).
   * @returns A true value always.
   */
  async expire(key: string, expiresIn: number): Promise<boolean> {
    return new Promise(resolve => resolve(true));
  }

  /**
   * Retrieves the value of the specified key-pattern from the mock storage,
   * it is assumed that an array of strings will be mocked as data
   * @param key - The key-pattern to retrieve from the mock storage.
   * @returns An array of data.
   */
  getFromPattern(key: string): Promise<string[]> {
    return new Promise(resolve => {
      const res = this.storage.filter(key);
      const result = [];
      res.forEach(v => result.push(v.key));
      return resolve(result.length ? result : undefined);
    });
  }

}
