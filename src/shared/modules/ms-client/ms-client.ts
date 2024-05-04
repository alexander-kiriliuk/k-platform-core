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
import { HttpException, HttpStatus, Inject, Logger } from "@nestjs/common";
import { ObjectUtils } from "../../utils/object.utils";
import { MessageBus, MsClientOptions } from "./ms-client.types";
import { LOGGER } from "../log/log.constants";
import { MS_EXCEPTION_ID } from "../../constants";
import { MsException } from "../../exceptions/ms.exception";
import inspect = ObjectUtils.inspect;

/**
 * Microservices client for dispatching messages between microservices.
 */
export class MsClient implements MessageBus {
  constructor(
    @Inject(LOGGER) private readonly logger: Logger,
    private readonly proxy: ClientProxy
  ) {
  }

  /**
   * Dispatches a message with the given pattern and data.
   * @param pattern - The message pattern.
   * @param data - The message data.
   * @param opts - Optional configuration options for the client.
   * @returns A promise resolving to the result of the dispatched message.
   */
  dispatch<TResult = any, TInput = any>(
    pattern: any,
    data: TInput = Object(),
    opts?: MsClientOptions
  ): Promise<TResult> {
    return new Promise<TResult>((resolve, reject) => {
      const source = this.proxy.send<TResult, TInput>(pattern, data);
      this.handleRequest(source, pattern, data, opts).subscribe({
        next: (result) => resolve(result),
        error: (error) => reject(error)
      });
    });
  }

  /**
   * Sends a message with the given pattern and data.
   * @param pattern - The message pattern.
   * @param data - The message data.
   * @param opts - Optional configuration options for the client.
   * @returns An observable of the result of the send message.
   */
  send<TResult = any, TInput = any>(
    pattern: any,
    data: TInput,
    opts?: MsClientOptions
  ) {
    const source = this.proxy.send<TResult, TInput>(pattern, data);
    return this.handleRequest(source, pattern, data, opts);
  }

  /**
   * Emits a message with the given pattern and data.
   * @param pattern - The message pattern.
   * @param data - The message data.
   * @param opts - Optional configuration options for the client.
   * @returns An observable of the result of the emitted message.
   */
  emit<TResult = any, TInput = any>(
    pattern: any,
    data: TInput,
    opts?: MsClientOptions
  ) {
    const source = this.proxy.emit<TResult, TInput>(pattern, data);
    return this.handleRequest(source, pattern, data, opts);
  }

  private handleRequest<T>(
    source: Observable<T>,
    pattern: any,
    data: any,
    opts?: MsClientOptions
  ): Observable<T> {
    this.logger.debug(`Sending request with pattern: ${inspect(pattern)}`);
    return source.pipe(
      timeout(opts?.timeout || parseInt(process.env.TRANSPORT_TIMEOUT)),
      catchError((error) => {
        if (error?.type === MS_EXCEPTION_ID) {
          const err = error as MsException;
          this.logger.error(
            `Microservice exception: ${err.message}`,
            err.stack
          );
          throw new HttpException(err.message, err.code);
        }
        if (error.name === "TimeoutError") {
          this.logger.warn(`Request timeout for pattern: ${inspect(pattern)}`);
          throw new HttpException(
            "Request Timeout",
            HttpStatus.REQUEST_TIMEOUT
          );
        }
        this.logger.error(
          `Unknown error for pattern: ${inspect(pattern)}`,
          error
        );
        return throwError(error);
      }),
    );
  }
}
