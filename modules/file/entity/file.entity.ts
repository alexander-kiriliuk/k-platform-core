import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  TableInheritance
} from "typeorm";
import { MediaEntity } from "@media/entity/media.entity";
import { File } from "../file.types";
import { FileMetadataEntity } from "@files/entity/file-metadata.entity";

@Entity("files")
@TableInheritance({ column: { type: "varchar", name: "class", nullable: true } })
export class FileEntity implements File {

  @PrimaryGeneratedColumn({ zerofill: true })
  id: number;

  @Index({ unique: true })
  @Column("varchar", { nullable: true })
  code: string;

  @Column("varchar", { nullable: true })
  name: string;

  @Column("varchar", { nullable: true })
  path: string;

  @Column("boolean", { default: false })
  public: boolean;

  @Column("int", { nullable: true })
  size: number;

  @ManyToOne(() => MediaEntity, t => t.code)
  icon: MediaEntity;

  @ManyToOne(() => MediaEntity, t => t.code)
  preview: MediaEntity;

  @OneToOne(() => FileMetadataEntity, t => t.id, {
    cascade: true,
    onDelete: "CASCADE"
  })
  @JoinColumn()
  metadata: FileMetadataEntity;

  @Index()
  @CreateDateColumn({ name: "ts_created", type: "timestamp" })
  tsCreated: Date;

}
