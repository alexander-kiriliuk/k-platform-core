import { Column, Entity, Index, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { MediaTypeEntity } from "./media-type.entity";
import { MediaFileEntity } from "./media-file.entity";
import { Media } from "../media.types";
import { LocalizedStringEntity } from "@shared/modules/locale/entity/localized-string.entity";

@Entity("medias")
export class MediaEntity implements Media {

  @PrimaryGeneratedColumn({ zerofill: true })
  id: number;

  @Index({ unique: true })
  @Column("varchar", { nullable: true })
  code: string;

  @ManyToMany(() => LocalizedStringEntity)
  @JoinTable()
  name: LocalizedStringEntity[];

  @ManyToOne(t => MediaTypeEntity, type => type.code)
  type: MediaTypeEntity;

  @OneToMany(a => MediaFileEntity, f => f.media)
  files: MediaFileEntity[];

}
