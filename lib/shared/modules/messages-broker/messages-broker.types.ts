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
 * Interface defining the contract for message brokering.
 */
export interface MessagesBroker {
  /**
   * Emits a message to a specific channel.
   * @param chanel - The channel to emit the message to.
   * @param data - The data to emit.
   */
  emit<T = unknown>(chanel: string, data: T): Promise<void>;

  /**
   * Subscribes to a specific channel with a handler function.
   * @param chanel - The channel to subscribe to.
   * @param handler - The handler function to handle the data.
   */
  subscribe<T = unknown>(chanel: string, handler: (data: T) => void);

  /**
   * Unsubscribes from a specific channel.
   * @param chanel - The channel to unsubscribe from.
   */
  unsubscribe(chanel: string);
}
