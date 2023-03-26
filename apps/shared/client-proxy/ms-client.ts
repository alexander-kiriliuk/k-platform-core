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

import { ClientProxy } from "@nestjs/microservices";

export class MsClient {

  constructor(
    readonly proxy: ClientProxy) {
  }

  dispatch<TResult = any, TInput = any>(pattern: any, data: TInput): Promise<TResult> {
    return new Promise<TResult>((resolve, reject) => {
      this.proxy.send<TResult, TInput>(pattern, data).subscribe({
        next: result => resolve(result),
        error: error => reject(error),
      });
    });
  }

  send<TResult = any, TInput = any>(pattern: any, data: TInput) {
    return this.proxy.send<TResult, TInput>(pattern, data);
  }

  emit<TResult = any, TInput = any>(pattern: any, data: TInput) {
    return this.proxy.emit<TResult, TInput>(pattern, data);
  }

}
