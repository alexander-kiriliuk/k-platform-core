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
import { RedisService } from "@liaoliaots/nestjs-redis";

@Injectable()
export class RedisProxyService {

  constructor(
    private readonly redisService: RedisService) {
  }

  get client() {
    return this.redisService.getClient();
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
        reject(err);
      });
    });
  }

}
