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

import { Observable } from "rxjs";
import { Repository } from "typeorm";
import { MsRepository } from "@shared/modules/ms-client/ms-repository";

export type MsClientOptions = {
  timeout: number;
}

export interface MessageBus {

  dispatch<TResult = any, TInput = any>(pattern: any, data?: TInput, opts?: MsClientOptions): Promise<TResult>;

  send<TResult = any, TInput = any>(pattern: any, data?: TInput, opts?: MsClientOptions): Observable<TResult>;

  emit<TResult = any, TInput = any>(pattern: any, data?: TInput, opts?: MsClientOptions): Observable<TResult>;

}

export type MsRepositoryFactory = { create: <T>(rep: Repository<T>) => MsRepository<T, unknown> };

export type MsDependencyParams = {
  key?: string;
  create?: string;
  read?: string;
  update?: string;
  delete?: string;
  timeout?: number;
};

export type MsDependencyOptions<T> = Partial<Record<keyof T, MsDependencyParams>>;