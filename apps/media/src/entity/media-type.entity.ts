import { Column, Entity, Index, JoinTable, ManyToMany, ManyToOne, PrimaryColumn } from "typeorm";
import { MediaFormatEntity } from "./media-format.entity";
import { MediaType } from "@media/src/media.types";
import { MediaExtEntity } from "@media/src/entity/media-ext.entity";

@Entity("medias_types")
export class MediaTypeEntity implements MediaType {

  @Index({ unique: true })
  @PrimaryColumn("varchar")
  code: string;

  @Index()
  @Column("varchar", { nullable: false })
  name: string;

  @Column("boolean", { default: false })
  vp6: boolean;

  @Column("boolean", { default: false })
  private: boolean;

  @Column("int", { nullable: true })
  quality: number;

  @ManyToOne(() => MediaExtEntity, e => e.code)
  ext: MediaExtEntity;

  @ManyToMany(() => MediaFormatEntity)
  @JoinTable()
  formats: MediaFormatEntity[];

}
