import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { MediaEntity } from "./media.entity";
import { MediaFile } from "@media/src/media";

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

  @Column("varchar", { nullable: true })
  format: string;

  @Column("int", { nullable: true })
  size: number;

  @ManyToOne(type => MediaEntity)
  media: MediaEntity;

}
