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
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { DatabaseModule } from "@shared/constants";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "@user/src/entity/user.entity";

@Module({
  imports: [
    DatabaseModule.forRoot(),
    TypeOrmModule.forFeature([
      UserEntity,
    ]),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {
}
