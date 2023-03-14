import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";
import { TypeCategory } from "@shared/type/type";

@Entity("types_categories")
export class TypeCategoryEntity implements TypeCategory {

  @PrimaryGeneratedColumn({ zerofill: true })
  id: number;

  @Index({ unique: true })
  @Column("varchar")
  code: string;

  @Index()
  @Column("varchar", { nullable: true })
  name: string;

}
