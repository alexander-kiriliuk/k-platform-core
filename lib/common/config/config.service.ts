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

import { Inject, Injectable, Logger } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
import {
  CONFIG_CACHE_PREFIX,
  CONFIG_FILE_EXT_PATTERN,
  FILES_ENCODING,
  GEN_SRC_DIR,
  KP_PROPERTIES_FILE_NAME,
  LOCAL_PROPERTIES_FILE_NAME,
  PROPERTIES_FILE_EXT_PATTERN,
} from "./config.constants";
import { ConfigItem } from "./config.types";
import { LOGGER } from "../../shared/modules/log/log.constants";
import { CacheService } from "../../shared/modules/cache/cache.types";
import {
  PageableData,
  PageableParams,
} from "../../shared/modules/pageable/pageable.types";

/**
 * ConfigService is a service responsible for managing configurations in application.
 * It reads configuration properties from .properties files and stores the values in a store for fast retrieval.
 * The service provides methods to get, set, and remove configuration properties.
 */
@Injectable()
export class ConfigService {
  private readonly propertiesFiles: { [path: string]: { [key: string]: any } } =
    {};
  private readonly valuesOfProperties: { [key: string]: any } = {};
  private generatedTsOutput: string;

  constructor(
    @Inject(LOGGER) private readonly logger: Logger,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Initializes the service by scanning for properties files, generating config files, and synchronizing the cache.
   */
  async initWithPropertiesFiles(genCnfDir?: string) {
    this.generatedTsOutput = genCnfDir;
    this.logger.log(`Scan project`);
    await this.scanForPropertiesFiles(process.cwd());
    this.logger.log(`Clean generated source dirs`);
    await this.deleteExistingConfigTsFiles(process.cwd());
    this.logger.log(`Clean config storage`);
    await this.cacheService.del(CONFIG_CACHE_PREFIX + ":*");
    this.logger.log(`Generate config files`);
    await this.generateConfigTsFiles();
    for (const key in this.valuesOfProperties) {
      await this.cacheService.set(`${key}`, this.valuesOfProperties[key]);
    }
    this.logger.log(`Config files was synchronize`);
  }

  /**
   * Retrieves a page of configuration properties based on the provided pageable parameters.
   * @param params - Pageable parameters for sorting, filtering, and pagination.
   * @returns A promise that resolves to an object containing the pageable data.
   */
  async getPropertiesPage(
    params: PageableParams,
  ): Promise<PageableData<ConfigItem>> {
    const { limit, page, sort, order, filter } = params;
    const propertyKeys = await this.cacheService.getFromPattern(
      `${CONFIG_CACHE_PREFIX}:${!filter ? "*" : filter}`,
    );
    const sortedKeys = propertyKeys.sort((a, b) => {
      if (sort && order) {
        const aValue = a[sort] || "";
        const bValue = b[sort] || "";
        return order === "ASC"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      return a.localeCompare(b);
    });
    const totalCount = sortedKeys.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const keysToRetrieve = sortedKeys.slice(start, end);
    const propertiesWithValues: ConfigItem[] = await Promise.all(
      keysToRetrieve.map(async (key) => {
        const value = await this.cacheService.get(key);
        return { key: key.replace(`${CONFIG_CACHE_PREFIX}:`, ``), value };
      }),
    );
    return new PageableData(propertiesWithValues, totalCount, page, limit);
  }

  /**
   * Sets a configuration property.
   * @param item - An object containing the key and value of the configuration property.
   * @returns A promise that resolves to a boolean indicating whether the operation was successful.
   */
  async setProperty(item: ConfigItem): Promise<boolean> {
    const fullKey = `${CONFIG_CACHE_PREFIX}:${item.key}`;
    return await this.cacheService.set(fullKey, item.value);
  }

  /**
   * Removes a configuration property.
   * @param key - The key of the configuration property to remove.
   * @returns A promise that resolves to a boolean indicating whether the operation was successful.
   */
  async removeProperty(key: string): Promise<boolean> {
    const fullKey = `${CONFIG_CACHE_PREFIX}:${key}`;
    return await this.cacheService.del(fullKey);
  }

  /**
   * Scans the specified directory for properties files and processes them.
   * @param directory - The directory to scan for properties files.
   * @param globalKpContent - The content of the global KP properties file, if any.
   */
  private async scanForPropertiesFiles(
    directory: string,
    globalKpContent: string | null = null,
  ) {
    const files = await fs.promises.readdir(directory, { withFileTypes: true });
    if (directory === process.cwd()) {
      for (const file of files) {
        if (file.isFile() && file.name === KP_PROPERTIES_FILE_NAME) {
          const kpPath = path.join(directory, file.name);
          globalKpContent = await fs.promises.readFile(kpPath, FILES_ENCODING);
          const localPropertiesPath = path.join(
            directory,
            LOCAL_PROPERTIES_FILE_NAME,
          );
          if (fs.existsSync(localPropertiesPath)) {
            const localPropertiesContent = await fs.promises.readFile(
              localPropertiesPath,
              FILES_ENCODING,
            );
            globalKpContent = this.mergePropertiesContent(
              globalKpContent,
              localPropertiesContent,
            );
          }
          break;
        }
      }
    }
    for (const file of files) {
      const fullPath = path.join(directory, file.name);
      if (file.isDirectory()) {
        await this.scanForPropertiesFiles(fullPath, globalKpContent);
      } else if (
        file.isFile() &&
        path.extname(file.name) === PROPERTIES_FILE_EXT_PATTERN
      ) {
        let fileContent = await fs.promises.readFile(fullPath, FILES_ENCODING);
        const localPropertiesPath = path.join(
          directory,
          LOCAL_PROPERTIES_FILE_NAME,
        );
        if (fs.existsSync(localPropertiesPath)) {
          const localPropertiesContent = await fs.promises.readFile(
            localPropertiesPath,
            FILES_ENCODING,
          );
          fileContent = this.mergePropertiesContent(
            fileContent,
            localPropertiesContent,
          );
        }
        if (globalKpContent) {
          fileContent = this.mergePropertiesContent(
            fileContent,
            globalKpContent,
          );
        }
        const fileNamePrefix = path.basename(
          fullPath,
          PROPERTIES_FILE_EXT_PATTERN,
        );
        this.propertiesFiles[fullPath] =
          await this.processAndValidatePropertiesContent(
            fullPath,
            fileContent,
            fileNamePrefix,
          );
      }
    }
  }

  /**
   * Processes and validates the content of a properties file.
   * @param filePath - The path to the properties file.
   * @param content - The content of the properties file.
   * @param fileNamePrefix - The prefix to use for the properties in the file.
   * @returns An object containing the processed data.
   */
  private async processAndValidatePropertiesContent(
    filePath: string,
    content: string,
    fileNamePrefix: string,
  ) {
    const lines = content.split("\n");
    const processedData: { [key: string]: any } = {};
    for (const line of lines) {
      if (line.trim().startsWith("#") || line.trim().length === 0) {
        continue;
      }
      const [key, value] = line.split("=");
      let keyWithoutPrefix = key;
      if (key.startsWith(fileNamePrefix + ".")) {
        keyWithoutPrefix = key.slice(fileNamePrefix.length + 1);
      } else {
        continue;
      }
      const variableName = keyWithoutPrefix
        .split(".")
        .map((part) => part.toUpperCase())
        .join("_");
      if (!/^[_a-zA-Z][_a-zA-Z0-9]*$/.test(variableName)) {
        this.logger.error(`Invalid line found: "${line}" in file ${filePath}`);
        throw new Error(`Invalid content in file: "${filePath}"`);
      }
      const propertyKey = `${CONFIG_CACHE_PREFIX}:${fileNamePrefix}.${keyWithoutPrefix}`;
      processedData[variableName] = `"${propertyKey}"`;
      if (!propertyKey.startsWith("kp.") && !propertyKey.startsWith("local.")) {
        this.valuesOfProperties[propertyKey] = this.parseValue(value.trim());
      }
    }
    return processedData;
  }

  /**
   * Parses the value of a configuration property.
   * @param value - The value to parse.
   * @returns The parsed value.
   */
  private parseValue(value: string) {
    let processedValue = value.trim();
    if (processedValue === "true" || processedValue === "false") {
      processedValue = JSON.parse(processedValue);
    } else if (processedValue === "null") {
      processedValue = null;
    } else if (/^[-+*/\d\s()]*$/.test(processedValue)) {
      try {
        processedValue = eval(processedValue);
      } catch (e) {
        return processedValue;
      }
    }
    return processedValue;
  }

  /**
   * Generates a namespace with variables based on the processed data.
   * @param namespaceName - The name of the namespace.
   * @param processedData - The processed data to include in the namespace.
   * @returns The generated namespace content as a string.
   */
  private generateNamespaceWithVariables(
    namespaceName: string,
    processedData: { [key: string]: string },
  ) {
    let generatedContent = `export namespace ${namespaceName} {\n`;
    for (const variableName in processedData) {
      const processedValue = processedData[variableName];
      generatedContent += `  export const ${variableName} = ${processedValue};\n`; // initial value: ${this.valuesOfProperties[processedValue.substring(1,processedValue.length-1)]}
    }
    generatedContent += "}\n";
    return generatedContent;
  }

  /**
   * Deletes existing configuration TypeScript files in the specified directory.
   * @param directory - The directory to scan for generated configuration files.
   */
  private async deleteExistingConfigTsFiles(directory: string) {
    if (directory === process.cwd() + "/node_modules") {
      return;
    }
    const files = await fs.promises.readdir(directory, { withFileTypes: true });
    for (const file of files) {
      const fullPath = path.join(directory, file.name);
      if (file.isDirectory()) {
        if (file.name === GEN_SRC_DIR) {
          const genSrcFiles = await fs.promises.readdir(fullPath, {
            withFileTypes: true,
          });
          this.logger.verbose(`Read dir: ${fullPath}`);
          for (const genSrcFile of genSrcFiles) {
            if (
              genSrcFile.isFile() &&
              genSrcFile.name.endsWith(CONFIG_FILE_EXT_PATTERN)
            ) {
              this.logger.verbose(`Delete file: ${genSrcFile.name}`);
              await fs.promises.unlink(path.join(fullPath, genSrcFile.name));
            }
          }
        } else {
          await this.deleteExistingConfigTsFiles(fullPath);
        }
      }
    }
  }

  /**
   * Generates TypeScript configuration files based on the processed properties files.
   */
  private async generateConfigTsFiles() {
    for (const filePath in this.propertiesFiles) {
      if (path.basename(filePath) === LOCAL_PROPERTIES_FILE_NAME) {
        continue;
      }
      const fileContent = this.propertiesFiles[filePath];
      const dirPath = this.generatedTsOutput ?? path.dirname(filePath);
      const genSrcPath = path.join(dirPath, GEN_SRC_DIR);
      const configFileName = path
        .basename(filePath, PROPERTIES_FILE_EXT_PATTERN)
        .concat(CONFIG_FILE_EXT_PATTERN);
      const configFilePath = path.join(genSrcPath, configFileName);
      const namespaceName =
        path
          .basename(filePath, PROPERTIES_FILE_EXT_PATTERN)
          .charAt(0)
          .toUpperCase() +
        path.basename(filePath, PROPERTIES_FILE_EXT_PATTERN).slice(1) +
        "Config";
      const generatedFileContent = this.generateNamespaceWithVariables(
        namespaceName,
        fileContent,
      );
      await fs.promises.mkdir(genSrcPath, { recursive: true });
      await fs.promises.writeFile(configFilePath, generatedFileContent);
      this.logger.verbose(`Generated ${configFilePath}`);
    }
  }

  /**
   * Merges the content of the main properties file with the content of the local properties file.
   * @param mainContent - The content of the main properties file.
   * @param localContent - The content of the local properties file.
   * @returns The merged content.
   */
  private mergePropertiesContent(
    mainContent: string,
    localContent: string,
  ): string {
    const mainContentLines = mainContent.split("\n");
    const localContentLines = localContent.split("\n");
    const mergedContent = [...mainContentLines];
    for (const localLine of localContentLines) {
      if (localLine.trim().startsWith("#") || localLine.trim().length === 0) {
        continue;
      }
      const [localKey] = localLine.split("=");
      for (let i = 0; i < mainContentLines.length; i++) {
        const mainLine = mainContentLines[i];
        if (mainLine.trim().startsWith(localKey + "=")) {
          mergedContent[i] = localLine;
          break;
        }
      }
      mergedContent.push(localLine);
    }
    return mergedContent.join("\n");
  }
}
