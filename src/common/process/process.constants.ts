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

export namespace Process {
  const REGISTERED_PROCESSES: Map<string, AbstractProcess> = new Map<
    string,
    AbstractProcess
  >();

  export enum Status {
    Execute = "execute",
    Ready = "ready",
    Crashed = "crashed",
  }

  export enum Command {
    Register = "process:register",
    Unregister = "process:unregister",
    Start = "process:start",
    Stop = "process:stop",
  }

  export enum LogLevel {
    Log = "LOG",
    Error = "ERROR",
    Warn = "WARN",
    Verbose = "VERBOSE",
    Debug = "DEBUG",
  }

  export function getRegisteredProcesses() {
    return REGISTERED_PROCESSES;
  }

  export function registerProcess<T extends AbstractProcess>(process: T) {
    const processName = process.constructor.name;
    if (REGISTERED_PROCESSES.has(processName)) {
      throw new InternalServerErrorException(
        `Process ${processName} already defined`
      );
    }
    REGISTERED_PROCESSES.set(processName, process);
  }

  export function hasProcessInstance(code: string) {
    return REGISTERED_PROCESSES.has(code);
  }

  export function getProcessInstance(code: string) {
    const registeredProcesses = getRegisteredProcesses();
    const process = registeredProcesses.get(code);
    if (!process) {
      return;
    }
    return process;
  }
}
