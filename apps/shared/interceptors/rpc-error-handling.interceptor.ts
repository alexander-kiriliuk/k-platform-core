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

import { catchError, Observable } from "rxjs";
import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { TooManyRequestsException } from "@shared/exceptions/too-many-requests.exception";

@Injectable()
export class RpcErrorHandlingInterceptor implements NestInterceptor {

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        if (error && error.response && typeof error.status === "number") {
          const { status, response } = error;
          switch (status) {
            case HttpStatus.TOO_MANY_REQUESTS:
              throw new TooManyRequestsException(response.message);
            case HttpStatus.BAD_REQUEST:
              throw new BadRequestException(response.message);
          }
        }
        throw error;
      }),
    );
  }

}
