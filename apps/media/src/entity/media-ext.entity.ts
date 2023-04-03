import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";
import { MediaExt } from "@media/src/media.types";

@Entity("medias_ext")
export class MediaExtEntity implements MediaExt {

  @PrimaryGeneratedColumn({ zerofill: true }) id: number;

  @Index({ unique: true })
  @Column("varchar") code: string;

  @Index()
  @Column("varchar", { nullable: false }) name: string;

}
