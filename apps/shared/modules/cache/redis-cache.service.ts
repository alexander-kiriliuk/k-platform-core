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

import { Injectable, Logger } from "@nestjs/common";
import { RedisService } from "@liaoliaots/nestjs-redis";
import { CacheService } from "@shared/modules/cache/cache.types";

@Injectable()
export class RedisCacheService implements CacheService {

  constructor(
    private readonly redis: RedisService,
    private readonly logger: Logger) {
  }

  private get client() {
    return this.redis.getClient();
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      this.logger.error(`Error while getting key "${key}" from Redis:`, error);
      return null;
    }
  }

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

  async del(...keys: string[]): Promise<boolean> {
    try {
      await this.client.del(...keys);
      return true;
    } catch (error) {
      this.logger.error(`Error while deleting keys "${keys.join(", ")}" from Redis:`, error);
      return false;
    }
  }

  async incr(key: string): Promise<number | null> {
    try {
      return await this.client.incr(key);
    } catch (error) {
      this.logger.error(`Error while incrementing key "${key}" in Redis:`, error);
      return null;
    }
  }

  async expire(key: string, expiresIn: number): Promise<boolean> {
    try {
      await this.client.expire(key, expiresIn);
      return true;
    } catch (error) {
      this.logger.error(`Error while setting expiration for key "${key}" in Redis:`, error);
      return false;
    }
  }

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
