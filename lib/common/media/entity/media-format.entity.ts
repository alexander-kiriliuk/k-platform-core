import { Column, Entity, Index, PrimaryColumn } from "typeorm";
import { MediaFormat } from "../media.types";

/**
 * The entity stores the formats of media objects
 */
@Entity("medias_format")
export class MediaFormatEntity implements MediaFormat {
  @Index({ unique: true })
  @PrimaryColumn("varchar")
  code: string;

  @Index()
  @Column("varchar", { nullable: false })
  name: string;

  @Column("smallint", { nullable: true })
  width: string;

  @Column("smallint", { nullable: true })
  height: string;
}
