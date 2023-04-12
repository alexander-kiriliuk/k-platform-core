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

import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthService } from "@auth/src/auth.service";
import { CacheModule } from "@shared/modules/cache/cache.module";
import { LogModule } from "@shared/modules/log/log.module";
import { MsClientModule } from "@shared/modules/ms-client/ms-client.module";
import { AuthConfig } from "@auth/gen-src/auth.config";
import { CacheService } from "@shared/modules/cache/cache.types";

@Module({
  controllers: [
    AuthController,
  ],
  imports: [
    PassportModule,
    CacheModule,
    LogModule,
    MsClientModule,
    JwtModule.registerAsync({
      imports: [CacheModule],
      inject: [CacheService],
      useFactory: async (cs: CacheService) => {
        return {
          secret: await cs.get(AuthConfig.JWT_SECRET),
          signOptions: { expiresIn: await cs.getNumber(AuthConfig.ACCESS_TOKEN_EXPIRATION) },
        };
      },
    }),
  ],
  providers: [
    AuthService,
  ],
})
export class AuthModule {
}
