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

/**
 * @class Roles
 * A class containing static constants representing different user roles.
 */
export class Roles {
  /**
   * @constant ROOT
   * Represents the root role with the highest level of access.
   */
  static readonly ROOT = "root";
  /**
   * @constant ADMIN
   * Represents the admin role with administrative access.
   */
  static readonly ADMIN = "admin";
  /**
   * @constant MANAGER
   * Represents the manager role.
   */
  static readonly MANAGER = "manager";
}

/**
 * @const REQUEST_PROPS
 * An object containing properties used for request handling.
 */
export const REQUEST_PROPS = {
  /**
   * @property accessToken
   * The property name for storing the access token in the request.
   */
  accessToken: "accessToken",

  /**
   * @property currentUser
   * The property name for storing the current user in the request.
   */
  currentUser: "currentUser",
};

/**
 * @constant MS_EXCEPTION_ID
 * A constant representing the exception identifier for microservices.
 */
export const MS_EXCEPTION_ID = "MsException";
