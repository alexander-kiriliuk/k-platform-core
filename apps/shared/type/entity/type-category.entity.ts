import { Column, Entity, Index, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { TypeCategory } from "@shared/type/type.types";
import { LocalizedStringEntity } from "@shared/locale/entity/localized-string.entity";

@Entity("types_categories")
export class TypeCategoryEntity implements TypeCategory {

  @PrimaryGeneratedColumn({ zerofill: true })
  id: number;

  @Index({ unique: true })
  @Column("varchar")
  code: string;

  @ManyToMany(() => LocalizedStringEntity)
  @JoinTable()
  name: LocalizedStringEntity[];

}
