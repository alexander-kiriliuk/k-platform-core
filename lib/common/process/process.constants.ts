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

import { AbstractProcess } from "./abstract-process";
import { InternalServerErrorException } from "@nestjs/common";

/**
 * Namespace containing enums and functions for process management.
 */
export namespace Process {
  /**
   * Sore for registered processes
   */
  const REGISTERED_PROCESSES: Map<string, AbstractProcess> = new Map<
    string,
    AbstractProcess
  >();

  /**
   * Enum of possible process statuses.
   */
  export enum Status {
    Execute = "execute",
    Ready = "ready",
    Crashed = "crashed",
  }

  /**
   * Enum of possible process commands.
   */
  export enum Command {
    Register = "process:register",
    Unregister = "process:unregister",
    Start = "process:start",
    Stop = "process:stop",
  }

  /**
   * Enum of log levels.
   */
  export enum LogLevel {
    Log = "LOG",
    Error = "ERROR",
    Warn = "WARN",
    Verbose = "VERBOSE",
    Debug = "DEBUG",
  }

  /**
   * Gets the store of registered processes.
   * @returns The map of registered processes.
   */
  export function getRegisteredProcesses() {
    return REGISTERED_PROCESSES;
  }

  /**
   * Registers a process.
   * @param process - The process to register.
   * @throws InternalServerErrorException if the process is already registered.
   */
  export function registerProcess<T extends AbstractProcess>(process: T) {
    const processName = process.constructor.name;
    if (REGISTERED_PROCESSES.has(processName)) {
      throw new InternalServerErrorException(
        `Process ${processName} already defined`,
      );
    }
    REGISTERED_PROCESSES.set(processName, process);
  }

  /**
   * Checks if a process instance is registered.
   * @param code - The code of the process.
   * @returns True if the process is registered, otherwise false.
   */
  export function hasProcessInstance(code: string) {
    return REGISTERED_PROCESSES.has(code);
  }

  /**
   * Gets a process instance by its code.
   * @param code - The code of the process.
   * @returns The process instance if found, otherwise undefined.
   */
  export function getProcessInstance(code: string) {
    const registeredProcesses = getRegisteredProcesses();
    const process = registeredProcesses.get(code);
    if (!process) {
      return;
    }
    return process;
  }
}
