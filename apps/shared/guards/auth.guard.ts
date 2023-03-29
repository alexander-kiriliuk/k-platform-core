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
import { AbstractAuthGuard } from "@shared/guards/abstract-auth.guard";
import { MsClient } from "@shared/client-proxy/ms-client";
import { CACHE_SERVICE, CacheService } from "@shared/modules/cache/cache.types";

@Injectable()
export class AuthGuard extends AbstractAuthGuard {

  constructor(
    @Inject(CACHE_SERVICE) protected readonly cacheService: CacheService,
    protected readonly msClient: MsClient) {
    super();
  }

}
