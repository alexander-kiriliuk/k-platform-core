import { Column, Entity, Index, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { MediaSizeEntity } from "./media-size.entity";
import { TypeEntity } from "@shared/modules/type/entity/type.entity";
import { MediaType } from "@media/src/media.types";

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

  @ManyToOne(t => TypeEntity, type => type.code)
  ext: TypeEntity;

  @ManyToMany(a => MediaSizeEntity)
  @JoinTable()
  sizes: MediaSizeEntity[];

}
