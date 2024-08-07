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

import { RpcException } from "@nestjs/microservices";
import { MS_EXCEPTION_ID } from "../constants";

/**
 * Base class for custom microservice exceptions, extending RpcException.
 */
export class MsException extends RpcException {
  constructor(
    readonly code: number,
    readonly message: string = undefined,
    readonly stack?: any,
  ) {
    super({ type: MS_EXCEPTION_ID, message, code, stack });
  }
}
