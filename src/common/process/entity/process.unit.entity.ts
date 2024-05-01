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

import { Column, CreateDateColumn, Entity, Index, JoinTable, ManyToMany, OneToMany, PrimaryColumn } from "typeorm";
import { Process } from "../process.constants";
import { ProcessUnit } from "../process.types";
import { ProcessLogEntity } from "./process.log.entity";
import { LocalizedStringEntity } from "../../../shared/modules/locale/entity/localized-string.entity";

@Entity("process_units")
export class ProcessUnitEntity implements ProcessUnit {

  @PrimaryColumn("varchar")
  code: string;

  @Index()
  @Column({
    type: "enum",
    enum: [Process.Status.Ready, Process.Status.Execute, Process.Status.Crashed],
    default: null,
    nullable: true
  })
  status: Process.Status;

  @Index()
  @Column("boolean", { default: false })
  enabled: boolean;

  @ManyToMany(() => LocalizedStringEntity, { cascade: true })
  @JoinTable()
  description: LocalizedStringEntity[];

  @Index()
  @Column("varchar", { name: "cron_tab", nullable: true })
  cronTab: string;

  @OneToMany(() => ProcessLogEntity, c => c.process, { cascade: true })
  logs: ProcessLogEntity[];

  @Index()
  @CreateDateColumn({ name: "ts_created", type: "timestamp" })
  tsCreated: Date;

}
