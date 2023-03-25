import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";
import { MediaSize } from "@media/src/media.types";

@Entity("medias_sizes")
export class MediaSizeEntity implements MediaSize {

  @PrimaryGeneratedColumn({ zerofill: true })
  id: number;

  @Index({ unique: true })
  @Column("varchar", { nullable: false })
  code: string;

  @Index()
  @Column("varchar", { nullable: false })
  name: string;

  @Column("smallint", { nullable: true })
  width: string;

  @Column("smallint", { nullable: true })
  height: string;

}
