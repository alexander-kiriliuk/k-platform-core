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

import { Observable, of } from "rxjs";
import { MessageBus, MsClientOptions } from "../ms-client.types";
import { MockStorage } from "../../mock/mock.storage";

/**
 * A mock service client for dispatching messages between microservices.
 */
export class MockMsClient implements MessageBus {
  constructor(private readonly storage: MockStorage) {
  }

  /**
   * Dispatches a message with the given pattern and data.
   * @param pattern - The message pattern.
   * @param data - Optional message data
   * @param opts - Optional configuration options for the client (not affect to anything).
   * @returns A promise resolving to the result of the dispatched message.
   */
  dispatch<TResult = any, TInput = any>(
    pattern: any,
    data: TInput,
    opts?: MsClientOptions
  ): Promise<TResult> {
    return new Promise<TResult>((resolve) => {
      const res = this.storage.find(pattern, data);
      resolve(res?.data as TResult);
    });
  }

  /**
   * Sends a message with the given pattern and data.
   * @param pattern - The message pattern.
   * @param data - Optional message data
   * @param opts - Optional configuration options for the client (not affect to anything).
   * @returns An observable of the result of the send message.
   */
  send<TResult = any, TInput = any>(
    pattern: any,
    data: TInput,
    opts?: MsClientOptions
  ): Observable<TResult> {
    const res = this.storage.find(pattern, data);
    return of(res?.data as TResult);
  }

  /**
   * Emits a message with the given pattern and data.
   * @param pattern - The message pattern.
   * @param data - Optional message data
   * @param opts - Optional configuration options for the client (not affect to anything).
   * @returns An observable of the result of the emitted message.
   */
  emit<TResult = any, TInput = any>(
    pattern: any,
    data: TInput,
    opts?: MsClientOptions
  ): Observable<TResult> {
    const res = this.storage.find(pattern, data);
    return of(res?.data as TResult);
  }
}
