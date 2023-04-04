import { Column, Entity, Index, PrimaryColumn } from "typeorm";
import { MediaExt } from "@media/src/media.types";

@Entity("medias_ext")
export class MediaExtEntity implements MediaExt {

  @Index({ unique: true })
  @PrimaryColumn("varchar")
  code: string;

  @Index()
  @Column("varchar", { nullable: false })
  name: string;

}
