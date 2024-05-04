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
import Redis from "ioredis";
import { MessagesBroker } from "./messages-broker.types";
import { REDIS_CLIENT } from "../cache/cache.constants";

@Injectable()
export class MessagesBrokerService implements MessagesBroker {

  private readonly subClient: Redis;
  private readonly subscribers: Map<string, (data: unknown) => void> = new Map();

  constructor(
    @Inject(REDIS_CLIENT) private readonly pubClient: Redis) {
    this.subClient = this.pubClient.duplicate();
    this.subClient.on("message", (chanel, data) => {
      if (!this.subscribers.has(chanel)) {
        return;
      }
      const fun = this.subscribers.get(chanel);
      fun(this.safeDeSerialize(data));
    });
  }

  async emit<T = unknown>(chanel: string, data: T) {
    await this.pubClient.publish(chanel, this.safeSerialize(data));
  }

  subscribe<T = unknown>(chanel: string, handler: (data: T) => void) {
    this.subClient.subscribe(chanel);
    this.subscribers.set(chanel, handler);
  }

  unsubscribe(chanel: string) {
    this.subClient.unsubscribe(chanel);
    this.subscribers.delete(chanel);
  }

  private safeSerialize<T = unknown>(data: T) {
    try {
      return JSON.stringify(data);
    } catch (error) {
      return data.toString();
    }
  }

  private safeDeSerialize(data: string) {
    try {
      return JSON.parse(data);
    } catch (error) {
      return data;
    }
  }

}
