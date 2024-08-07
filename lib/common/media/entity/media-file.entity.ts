import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { MediaEntity } from "./media.entity";
import { MediaFile } from "../media.types";
import { MediaFormatEntity } from "./media-format.entity";

/**
 * The entity stores media object files (links)
 */
@Entity("medias_files")
export class MediaFileEntity implements MediaFile {
  @PrimaryGeneratedColumn({ zerofill: true })
  id: number;

  @Index({ unique: true })
  @Column("varchar", { nullable: true })
  code: string;

  @Index()
  @Column("varchar", { nullable: true })
  name: string;

  @Column("smallint", { nullable: true })
  width: number;

  @Column("smallint", { nullable: true })
  height: number;

  @Column("int", { nullable: true })
  size: number;

  @ManyToOne(() => MediaFormatEntity, (type) => type.code)
  format: MediaFormatEntity;

  @ManyToOne(() => MediaEntity)
  media: MediaEntity;
}
