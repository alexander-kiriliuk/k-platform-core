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

import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ProcessUnitEntity } from "./process.unit.entity";
import { ProcessLog } from "../process.types";

@Entity("process_logs")
export class ProcessLogEntity implements ProcessLog {
  @PrimaryGeneratedColumn({ zerofill: true })
  id: number;

  @Column("text", { nullable: true })
  content: string;

  @Index()
  @CreateDateColumn({ name: "ts_created", type: "timestamp" })
  tsCreated: Date;

  @Index()
  @UpdateDateColumn({ name: "ts_updated", type: "timestamp" })
  tsUpdated: Date;

  @ManyToOne(() => ProcessUnitEntity, (t) => t.code)
  process: ProcessUnitEntity;
}
