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

import { UserService } from "@user/src/user.service";
import { Repository } from "typeorm";
import { UserEntity } from "@user/src/entity/user.entity";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { USER_RELATIONS } from "@user/src/user.constants";
import { NotFoundMsException } from "@shared/exceptions/not-found-ms.exception";
import { User } from "@user/src/user.types";

describe("UserService", () => {
  let userService: UserService;
  let userRep: Repository<UserEntity>;
  const testUser = {} as User;
  testUser.id = "123";
  testUser.login = "test";

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            save: jest.fn(),
            create: jest.fn()
          }
        }
      ]
    }).compile();
    userService = module.get<UserService>(UserService);
    userRep = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
  });

  it("call finding user by login", async () => {
    const login = "test";
    jest.spyOn(userRep, "findOne").mockResolvedValue(new UserEntity());
    const result = await userService.findByLogin(login);
    expect(userRep.findOne).toHaveBeenCalledWith({
      where: { login },
      relations: USER_RELATIONS
    });
    expect(result).toBe(testUser);
  });

  it("call finding user by ID", async () => {
    const id = "12345";
    jest.spyOn(userRep, "findOne").mockResolvedValue(new UserEntity());
    const result = await userService.findById(id);
    expect(userRep.findOne).toHaveBeenCalledWith({
      where: { id },
      relations: USER_RELATIONS
    });
    expect(result).toBe(testUser);
  });

  it("call update user", async () => {
    const id = "12345";
    jest.spyOn(userRep, "update").mockResolvedValue(undefined);
    jest.spyOn(userService, "findById").mockResolvedValue(testUser);
    const result = await userService.updateById(id, testUser);
    expect(userRep.update).toHaveBeenCalledWith(id, testUser);
    expect(userService.findById).toHaveBeenCalledWith(id);
    expect(result).toBe(testUser);
  });

  it("call create user", async () => {
    jest.spyOn(userRep, "create").mockImplementation(() => new UserEntity());
    jest.spyOn(userRep, "save").mockResolvedValue(new UserEntity());
    const result = await userService.create(testUser);
    expect(userRep.save).toHaveBeenCalledWith(testUser);
    expect(result).toBe(testUser);
  });

  it("remove a user by id", async () => {
    const id = "12345";
    jest.spyOn(userRep, "findOne").mockResolvedValue(new UserEntity());
    jest.spyOn(userRep, "remove").mockResolvedValue(new UserEntity());
    expect(await userService.removeById(id)).toEqual(testUser);
    expect(userRep.findOne).toHaveBeenCalledWith({ where: { id }, relations: USER_RELATIONS });
    expect(userRep.remove).toHaveBeenCalledWith(testUser);
  });

  it("throw an error if the user is not found", async () => {
    const id = "12345";
    jest.spyOn(userRep, "findOne").mockResolvedValue(undefined);
    await expect(userService.removeById(id)).rejects.toThrow(NotFoundMsException);
    expect(userRep.findOne).toHaveBeenCalledWith({ where: { id }, relations: USER_RELATIONS });
  });

});
