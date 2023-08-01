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

import { UserController } from "@user/src/user.controller";
import { UserService } from "@user/src/user.service";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { UserEntity } from "@user/src/entity/user.entity";
import { User, UserUpdateRequest } from "@user/src/user.types";

describe("UserController", () => {
  let userController: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {}
        }
      ]
    }).compile();
    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it("find user by login", async () => {
    const user = {} as User;
    jest.spyOn(userService, "findByLogin").mockImplementation(async () => user);
    expect(await userController.findUserByLogin("test")).toBe(user);
  });

  it("find user by id", async () => {
    const user = {} as User;
    jest.spyOn(userService, "findById").mockImplementation(async () => user);
    expect(await userController.findUserById("123")).toBe(user);
  });

  it("update user by id", async () => {
    const user = {} as User;
    const request: UserUpdateRequest = { id: "123", user };
    jest.spyOn(userService, "updateById").mockImplementation(async () => user);
    expect(await userController.updateUser(request)).toBe(user);
  });

  it("create user", async () => {
    const user = new UserEntity();
    jest.spyOn(userService, "create").mockImplementation(async () => user);
    expect(await userController.createUser({} as User)).toBe(user);
  });

  it("remove user", async () => {
    const user = {} as User;
    jest.spyOn(userService, "removeById").mockImplementation(async () => user);
    expect(await userController.removeUser("123")).toBe(user);
  });

});