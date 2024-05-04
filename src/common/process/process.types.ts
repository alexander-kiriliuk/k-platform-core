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

import { Process } from "./process.constants";
import { LocalizedString } from "../../shared/modules/locale/locale.types";

export class ProcessLog {
  id: number;
  content: string;
  tsCreated: Date;
  tsUpdated: Date;
  process: ProcessUnit;
}

export interface ProcessUnit {
  code: string;
  status: Process.Status;
  enabled: boolean;
  description: LocalizedString[];
  cronTab: string;
  logs: ProcessLog[];
  tsCreated: Date;
}
