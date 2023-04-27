import { Column, Entity, Index, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { MediaEntity } from "@media/src/entity/media.entity";
import { LocalizedStringEntity } from "@shared/modules/locale/entity/localized-string.entity";
import { File } from "@files/src/file.types";

@Entity("files")
export class FileEntity implements File {

  @PrimaryGeneratedColumn({ zerofill: true })
  id: number;

  @Index({ unique: true })
  @Column("varchar", { nullable: true })
  code: string;

  @ManyToMany(() => LocalizedStringEntity, { cascade: true })
  @JoinTable()
  name: LocalizedStringEntity[];

  @Column("varchar", { nullable: true })
  path: string;

  @Column("boolean", { default: false })
  public: boolean;

  @Column("int", { nullable: true })
  size: number;

  @ManyToOne(() => MediaEntity, t => t.code)
  icon: MediaEntity;

  @ManyToOne(() => MediaEntity, t => t.code)
  preview: MediaEntity;

}
