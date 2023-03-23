import { Column, Entity, Index, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { TypeCategoryEntity } from "@shared/type/entity/type-category.entity";
import { MediaEntity } from "@media/src/entity/media.entity";
import { Type } from "../type";
import { LocalizedStringEntity } from "@shared/locale/entity/localized-string.entity";

@Entity("types")
export class TypeEntity implements Type {

  @PrimaryGeneratedColumn({ zerofill: true })
  id: number;

  @Index({ unique: true })
  @Column("varchar")
  code: string;

  @ManyToMany(() => LocalizedStringEntity)
  @JoinTable()
  name: LocalizedStringEntity[];

  @ManyToMany(() => LocalizedStringEntity)
  @JoinTable()
  description: LocalizedStringEntity[];

  @ManyToOne(t => TypeCategoryEntity, c => c.code)
  category: TypeCategoryEntity;

  @ManyToOne(t => MediaEntity, t => t.code)
  image: MediaEntity;

}
