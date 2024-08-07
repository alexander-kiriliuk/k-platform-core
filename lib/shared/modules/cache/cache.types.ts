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
 * An abstract class defining methods for cache operations.
 */
export abstract class CacheService {
  abstract get(key: string): Promise<string>;

  abstract getNumber(key: string): Promise<number>;

  abstract getBoolean(key: string): Promise<boolean>;

  abstract set(
    key: string,
    value: string | number,
    expiration?: number,
  ): Promise<boolean>;

  abstract del(...keys: string[]): Promise<boolean>;

  abstract incr(key: string): Promise<number>;

  abstract expire(key: string, expiresIn: number): Promise<boolean>;

  abstract getFromPattern(pattern: string): Promise<string[]>;
}
