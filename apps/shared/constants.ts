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
import { DataSource } from "typeorm";
import { User } from "../user/src/user.entity";

export const MS_CLIENT = "MS_CLIENT";

export const TRANSPORT_OPTIONS = {
  host: "localhost",
  port: 6379,
};

export const TRANSPORT_TYPE = Transport.REDIS;

export const DB_CONFIG = new DataSource({
  type: "postgres",
  host: "localhost",
  schema: "core",
  port: 5432,
  synchronize: true,
  logging: true,
  database: "k_platform",
  username: "root",
  password: "1111",
  entities: [
    User,
  ],
  migrations: [],
  subscribers: [],
});
