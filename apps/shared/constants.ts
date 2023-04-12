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

import { Transport } from "@nestjs/microservices";
import { RedisClientOptions } from "@liaoliaots/nestjs-redis/dist/redis/interfaces/redis-module-options.interface";

export enum Role {
  ROOT = "root",
  ADMIN = "admin",
}

export const REQUEST_PROPS = {
  accessToken: "accessToken",
  currentUser: "currentUser",
};

export const MS_EXCEPTION_ID = "MsException";

export const API = {
  prefix: "api/v1",
  port: 3001,
};

export const TRANSPORT_TYPE = Transport.REDIS;

export const TRANSPORT_OPTIONS = {
  host: "localhost",
  port: 6379,
  timeout: 10000,
};

export const REDIS_OPTIONS: RedisClientOptions = {
  host: "localhost",
  port: 6379,
  db: 0,
};

