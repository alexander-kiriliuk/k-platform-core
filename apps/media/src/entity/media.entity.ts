import { Column, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { MediaTypeEntity } from "./media-type.entity";
import { MediaFileEntity } from "./media-file.entity";
import { Media } from "../media";

@Entity("medias")
export class MediaEntity implements Media {

  @PrimaryGeneratedColumn({ zerofill: true })
  id: number;

  @Index({ unique: true })
  @Column("varchar", { nullable: true })
  code: string;

  @Index()
  @Column("varchar", { nullable: true })
  name: string;

  @ManyToOne(t => MediaTypeEntity, type => type.code)
  type: MediaTypeEntity;

  @OneToMany(a => MediaFileEntity, f => f.media)
  files: MediaFileEntity[];

}
