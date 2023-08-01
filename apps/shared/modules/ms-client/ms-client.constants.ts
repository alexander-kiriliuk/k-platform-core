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

export const MS_CLIENT = Symbol("Messages bus client");
export const MSG_BUS = Symbol("Messages bus");
export const MS_REPOSITORY_FACTORY = Symbol("Factory for creating ms-repository instance");
export const MsDependencyMetadataKey = "ms_dependencies";
export const DEFAULT_MSD_PARAM_TIMEOUT = 50;
export const DEFAULT_MSD_PARAM_KEY = "id";
