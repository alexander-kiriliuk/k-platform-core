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

import { SetMetadata } from "@nestjs/common";

/**
 * A constant string key used for role-based access control metadata.
 * This key is used to annotate routes or controllers with the roles allowed to access them.
 */
export const AllowedForMetadataKey = "for_roles";

/**
 * ForRoles custom decorator for defining roles allowed to access a route.
 * @param roles - An array of roles allowed for access.
 */
export const ForRoles = (...roles: string[]) =>
  SetMetadata(AllowedForMetadataKey, roles);
