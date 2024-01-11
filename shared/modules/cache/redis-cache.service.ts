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

import { Inject, Injectable, Logger } from "@nestjs/common";
import { CacheService } from "@shared/modules/cache/cache.types";
import { LOGGER } from "@shared/modules/log/log.constants";
import Redis from "ioredis";
import { REDIS_CLIENT } from "@shared/modules/cache/cache.constants";

/**
 * A service class that provides cache storage functionality implementing the CacheService interface.
 */
@Injectable()
export class RedisCacheService implements CacheService {


  constructor(
    @Inject(LOGGER) private readonly logger: Logger,
    @Inject(REDIS_CLIENT) private readonly client: Redis) {
  }

  /**
   * Retrieves the value of the specified key from the cache storage.
   *
   * @param key - The key to retrieve from the cache.
   * @returns A Promise that resolves to the value of the key or null if an error occurs.
   */
  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      this.logger.error(`Error while getting key "${key}" from Redis:`, error);
      return null;
    }
  }

  /**
   * Retrieves the boolean value of the specified key from the cache storage.
   *
   * @param key - The key to retrieve from the cache.
   * @returns A Promise that resolves to the boolean value of the key.
   */
  async getBoolean(key: string) {
    const val = await this.get(key);
    return Boolean(val);
  }

  /**
   * Retrieves the numeric value of the specified key from the cache storage.
   *
   * @param key - The key to retrieve from the cache.
   * @returns A Promise that resolves to the numeric value of the key.
   */
  async getNumber(key: string) {
    const val = await this.get(key);
    return +val;
  }

  /**
   * Sets the value of the specified key in the cache storage with an optional expiration time.
   *
   * @param key - The key to set in the cache.
   * @param value - The value to set for the key.
   * @param expiresIn - Optional expiration time in seconds.
   * @returns A Promise that resolves to true if the operation is successful, false otherwise.
   */
  async set(key: string, value: string | number, expiresIn?: number): Promise<boolean> {
    try {
      if (expiresIn) {
        await this.client.set(key, value, "EX", expiresIn);
      } else {
        await this.client.set(key, value);
      }
      return true;
    } catch (error) {
      this.logger.error(`Error while setting key "${key}" in Redis:`, error);
      return false;
    }
  }

  /**
   * Deletes the specified keys from the cache storage.
   *
   * @param keys - The keys to delete from the cache.
   * @returns A Promise that resolves to true if the operation is successful, false otherwise.
   */
  async del(...keys: string[]): Promise<boolean> {
    try {
      await this.client.del(...keys);
      return true;
    } catch (error) {
      this.logger.error(`Error while deleting keys "${keys.join(", ")}" from Redis:`, error);
      return false;
    }
  }

  /**
   * Increments the value of the specified key in the cache storage.
   *
   * @param key - The key to increment.
   * @returns A Promise that resolves to the new value of the key or null if an error occurs.
   */
  async incr(key: string): Promise<number | null> {
    try {
      return await this.client.incr(key);
    } catch (error) {
      this.logger.error(`Error while incrementing key "${key}" in Redis:`, error);
      return null;
    }
  }

  /**
   * Sets the expiration time for the given key in the Redis cache.
   * @param key - The key to set the expiration time for.
   * @param expiresIn - The expiration time in seconds.
   * @returns True if the operation succeeded, false otherwise.
   */
  async expire(key: string, expiresIn: number): Promise<boolean> {
    try {
      await this.client.expire(key, expiresIn);
      return true;
    } catch (error) {
      this.logger.error(`Error while setting expiration for key "${key}" in Redis:`, error);
      return false;
    }
  }

  /**
   * Retrieves keys that match a given pattern from the Redis cache.
   * @param pattern - The pattern to match keys against.
   * @returns An array of matching keys.
   */
  getFromPattern(pattern: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const keys: string[] = [];
      const stream = this.client.scanStream({ match: pattern });
      stream.on("data", (chunk: string[]) => {
        keys.push(...chunk);
      });
      stream.on("end", () => {
        resolve(keys);
      });
      stream.on("error", (err: Error) => {
        this.logger.error(err);
        reject(err);
      });
    });
  }

}
