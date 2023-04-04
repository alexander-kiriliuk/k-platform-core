import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { MediaEntity } from "./media.entity";
import { MediaFile } from "@media/src/media.types";
import { MediaFormatEntity } from "@media/src/entity/media-format.entity";

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

  @ManyToOne(t => MediaFormatEntity, type => type.code)
  format: MediaFormatEntity;

  @ManyToOne(type => MediaEntity)
  media: MediaEntity;

}
