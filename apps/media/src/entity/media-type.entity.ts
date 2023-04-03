import { Column, Entity, Index, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { MediaSizeEntity } from "./media-size.entity";
import { MediaType } from "@media/src/media.types";
import { MediaExtEntity } from "@media/src/entity/media-ext.entity";

@Entity("medias_types")
export class MediaTypeEntity implements MediaType {

  @PrimaryGeneratedColumn({ zerofill: true })
  id: number;

  @Index({ unique: true })
  @Column("varchar", { nullable: false })
  code: string;

  @Index()
  @Column("varchar", { nullable: false })
  name: string;

  @Column("boolean", { default: false })
  vp6: boolean;

  @ManyToOne(t => MediaExtEntity, e => e.code)
  ext: MediaExtEntity;

  @ManyToMany(a => MediaSizeEntity)
  @JoinTable()
  sizes: MediaSizeEntity[];

}
