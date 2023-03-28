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
import { catchError, Observable, throwError, timeout } from "rxjs";
import { TRANSPORT_OPTIONS } from "@shared/constants";
import { HttpException } from "@nestjs/common";
import { MsClientOptions } from "@shared/client-proxy/ms-client.types";

export class MsClient {

  constructor(
    readonly proxy: ClientProxy) {
  }

  dispatch<TResult = any, TInput = any>(pattern: any, data: TInput, opts?: MsClientOptions): Promise<TResult> {
    return new Promise<TResult>((resolve, reject) => {
      const ob = this.proxy.send<TResult, TInput>(pattern, data);
      this.handleRequest(ob, opts).subscribe({
        next: result => resolve(result),
        error: error => reject(error),
      });
    });
  }

  send<TResult = any, TInput = any>(pattern: any, data: TInput, opts?: MsClientOptions) {
    const ob = this.proxy.send<TResult, TInput>(pattern, data);
    return this.handleRequest(ob, opts);
  }

  emit<TResult = any, TInput = any>(pattern: any, data: TInput, opts?: MsClientOptions) {
    const ob = this.proxy.emit<TResult, TInput>(pattern, data);
    return this.handleRequest(ob, opts);
  }

  private handleRequest<T>(source: Observable<T>, opts?: MsClientOptions): Observable<T> {
    return source.pipe(
      timeout(opts?.timeout || TRANSPORT_OPTIONS.timeout),
      catchError(error => {
        if (error.name === "TimeoutError") {
          throw new HttpException("Request Timeout", 408);
        }
        return throwError(error);
      }),
    );
  }

}

