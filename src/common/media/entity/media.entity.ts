import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  TableInheritance
} from "typeorm";
import { MediaTypeEntity } from "./media-type.entity";
import { MediaFileEntity } from "./media-file.entity";
import { Media } from "../media.types";
import { LocalizedStringEntity } from "../../../shared/modules/locale/entity/localized-string.entity";
import { FileMetadataEntity } from "../../file/entity/file-metadata.entity";

@Entity("medias")
@TableInheritance({
  column: { type: "varchar", name: "class", nullable: true }
})
export class MediaEntity implements Media {
  @PrimaryGeneratedColumn({ zerofill: true })
  id: number;

  @Index({ unique: true })
  @Column("varchar", { nullable: true })
  code: string;

  @ManyToMany(() => LocalizedStringEntity, { cascade: true })
  @JoinTable()
  name: LocalizedStringEntity[];

  @ManyToOne(() => MediaTypeEntity, (type) => type.code)
  type: MediaTypeEntity;

  @OneToMany(() => MediaFileEntity, (f) => f.media, { cascade: true })
  files: MediaFileEntity[];

  @OneToOne(() => FileMetadataEntity, (t) => t.id, {
    cascade: true,
    onDelete: "CASCADE"
  })
  @JoinColumn()
  metadata: FileMetadataEntity;

  @Index()
  @CreateDateColumn({ name: "ts_created", type: "timestamp" })
  tsCreated: Date;
}
