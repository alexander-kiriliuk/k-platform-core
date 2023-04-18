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

  @ManyToMany(() => LocalizedStringEntity, { cascade: true })
  @JoinTable()
  name: LocalizedStringEntity[];

  @ManyToOne(() => MediaTypeEntity, type => type.code)
  type: MediaTypeEntity;

  @OneToMany(() => MediaFileEntity, f => f.media, { cascade: true })
  files: MediaFileEntity[];

}
