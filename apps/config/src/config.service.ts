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

import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
import { LOGGER } from "@shared/modules/log/log.constants";
import {
  CONFIG_FILE_EXT_PATTERN,
  FILES_ENCODING,
  GEN_SRC_DIR,
  KP_PROPERTIES_FILE_NAME,
  LOCAL_PROPERTIES_FILE_NAME,
  PROPERTIES_FILE_EXT_PATTERN,
} from "./config.constants";


/**
 * ConfigService is responsible for scanning, processing, and generating
 * configuration files based on the properties files found in the project.
 */
@Injectable()
export class ConfigService implements OnModuleInit {

  private readonly propertiesFiles: { [path: string]: { [key: string]: any } } = {};

  constructor(
    @Inject(LOGGER) private readonly logger: Logger) {
  }

  /**
   * Executes the process of scanning, cleaning, and generating configuration files.
   */
  async onModuleInit() {
    this.logger.log(`Scan project`);
    await this.scanForPropertiesFiles(process.cwd());
    this.logger.log(`Clean generated source dirs`);
    await this.deleteExistingConfigTsFiles(process.cwd());
    this.logger.log(`Generate config files`);
    await this.generateConfigTsFiles();
    this.logger.log(`Generation process was finish`);
  }

  /**
   * Scans the specified directory and its subdirectories for .properties files
   * and processes their content, considering the precedence rules for
   * kp.properties and local.properties files.
   *
   * @param {string} directory - The path of the directory to scan for .properties files.
   * @param {string | null} globalKpContent - The content of the global kp.properties file, if any.
   */
  private async scanForPropertiesFiles(directory: string, globalKpContent: string | null = null) {
    const files = await fs.promises.readdir(directory, { withFileTypes: true });
    if (directory === process.cwd()) {
      for (const file of files) {
        if (file.isFile() && file.name === KP_PROPERTIES_FILE_NAME) {
          const kpPath = path.join(directory, file.name);
          globalKpContent = await fs.promises.readFile(kpPath, FILES_ENCODING);
          break;
        }
      }
    }
    for (const file of files) {
      const fullPath = path.join(directory, file.name);
      if (file.isDirectory()) {
        await this.scanForPropertiesFiles(fullPath, globalKpContent);
      } else if (file.isFile() && path.extname(file.name) === PROPERTIES_FILE_EXT_PATTERN) {
        let fileContent = await fs.promises.readFile(fullPath, FILES_ENCODING);
        const localPropertiesPath = path.join(directory, LOCAL_PROPERTIES_FILE_NAME);
        if (fs.existsSync(localPropertiesPath)) {
          const localPropertiesContent = await fs.promises.readFile(localPropertiesPath, FILES_ENCODING);
          fileContent = this.mergePropertiesContent(fileContent, localPropertiesContent);
        }
        if (globalKpContent) {
          fileContent = this.mergePropertiesContent(fileContent, globalKpContent);
        }
        const fileNamePrefix = path.basename(fullPath, PROPERTIES_FILE_EXT_PATTERN);
        this.propertiesFiles[fullPath] = await this.processAndValidatePropertiesContent(fullPath, fileContent, fileNamePrefix);
      }
    }
  }

  /**
   * Processes the content of a .properties file, validates its content,
   * and converts it into an object with key-value pairs.
   *
   * @param {string} filePath - The path of the .properties file.
   * @param {string} content - The content of the .properties file.
   * @param {string} fileNamePrefix - The prefix derived from the file name (without extension).
   * @returns {Promise<{ [key: string]: any }>} - An object containing the processed key-value pairs.
   */
  private async processAndValidatePropertiesContent(filePath: string, content: string, fileNamePrefix: string) {
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
      }
      const variableName = keyWithoutPrefix
        .split(".")
        .map((part) => part.toUpperCase())
        .join("_");
      if (!/^[_a-zA-Z][_a-zA-Z0-9]*$/.test(variableName)) {
        this.logger.error(`Invalid line found: "${line}" in file ${filePath}`);
        throw new Error(`Invalid content in file: "${filePath}"`);
      }
      processedData[variableName] = this.parseValue(value.trim());
    }
    return processedData;
  }

  /**
   * Parses a string value into its appropriate JavaScript representation.
   * @param value - The string value to parse.
   * @returns The parsed value as a JavaScript representation.
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
        processedValue = `"${processedValue}"`;
      }
    } else {
      processedValue = `"${processedValue}"`;
    }
    return processedValue;
  }

  /**
   Generates a namespace with variables based on the processed data.
   @param namespaceName - The name of the namespace to generate.
   @param processedData - The processed key-value pairs.
   @returns A string containing the generated namespace with variables.
   */
  private generateNamespaceWithVariables(namespaceName: string, processedData: { [key: string]: string }) {
    let generatedContent = `export namespace ${namespaceName} {\n`;
    for (const variableName in processedData) {
      const processedValue = processedData[variableName];
      generatedContent += `  export const ${variableName} = ${processedValue};\n`;
    }
    generatedContent += "}\n";
    return generatedContent;
  }

  /**
   Deletes existing config .ts files in the "gen-src" directory.
   @param directory - The directory to start searching for "gen-src" directories.
   */
  private async deleteExistingConfigTsFiles(directory: string) {
    const files = await fs.promises.readdir(directory, { withFileTypes: true });
    for (const file of files) {
      const fullPath = path.join(directory, file.name);
      if (file.isDirectory()) {
        if (file.name === GEN_SRC_DIR) {
          const genSrcFiles = await fs.promises.readdir(fullPath, { withFileTypes: true });
          this.logger.verbose(`Read dir: ${fullPath}`);
          for (const genSrcFile of genSrcFiles) {
            if (genSrcFile.isFile() && genSrcFile.name.endsWith(CONFIG_FILE_EXT_PATTERN)) {
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
   Generates config .ts files based on the properties files found.
   */
  private async generateConfigTsFiles() {
    for (const filePath in this.propertiesFiles) {
      if (path.basename(filePath) === LOCAL_PROPERTIES_FILE_NAME) {
        continue;
      }
      const fileContent = this.propertiesFiles[filePath];
      const dirPath = path.dirname(filePath);
      const genSrcPath = path.join(dirPath, GEN_SRC_DIR);
      const configFileName = path
        .basename(filePath, PROPERTIES_FILE_EXT_PATTERN)
        .concat(CONFIG_FILE_EXT_PATTERN);
      const configFilePath = path.join(genSrcPath, configFileName);
      const namespaceName = path
        .basename(filePath, PROPERTIES_FILE_EXT_PATTERN)
        .charAt(0)
        .toUpperCase() + path.basename(filePath, PROPERTIES_FILE_EXT_PATTERN).slice(1) + "Config";
      const generatedFileContent = this.generateNamespaceWithVariables(namespaceName, fileContent);
      await fs.promises.mkdir(genSrcPath, { recursive: true });
      await fs.promises.writeFile(configFilePath, generatedFileContent);
      this.logger.verbose(`Generated ${configFilePath}`);
    }
  }

  /**
   Merges the content of main and local properties files.
   @param mainContent - The content of the main properties file.
   @param localContent - The content of the local properties file.
   @returns A string containing the merged content of both files.
   */
  private mergePropertiesContent(mainContent: string, localContent: string): string {
    const mainContentLines = mainContent.split("\n");
    const localContentLines = localContent.split("\n");
    const mergedContent = [...mainContentLines];
    for (const localLine of localContentLines) {
      if (localLine.trim().startsWith("#") || localLine.trim().length === 0) {
        continue;
      }
      const [localKey] = localLine.split("=");
      let found = false;
      for (let i = 0; i < mainContentLines.length; i++) {
        const mainLine = mainContentLines[i];
        if (mainLine.trim().startsWith(localKey + "=")) {
          mergedContent[i] = localLine;
          found = true;
          break;
        }
      }
    }
    return mergedContent.join("\n");
  }

}
