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
 * The prefix used for storing configuration items.
 */
export const CONFIG_CACHE_PREFIX = "config";

/**
 * The directory where generated source files are stored.
 */
export const GEN_SRC_DIR = "gen-src";

/**
 * The pattern for configuration file extensions.
 */
export const CONFIG_FILE_EXT_PATTERN = ".config.ts";

/**
 * The pattern for properties file extensions.
 */
export const PROPERTIES_FILE_EXT_PATTERN = ".properties";

/**
 * The name of the local properties file
 * It is assumed that such files override neighboring ones .properties files and are out of version control.
 */
export const LOCAL_PROPERTIES_FILE_NAME = "local.properties";

/**
 * The name of the kp properties file.
 * It is assumed that this is the main configuration file, located in the root of the project
 * and can override the properties of any .properties in the entire project
 */
export const KP_PROPERTIES_FILE_NAME = "kp.properties";

/**
 * The encoding used for reading and writing configuration files.
 */
export const FILES_ENCODING = "utf-8";
