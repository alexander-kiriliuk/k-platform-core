import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { TypeCategoryEntity } from "@shared/type/entity/type-category.entity";
import { MediaEntity } from "@media/src/entity/media.entity";
import { Type } from "../type";

@Entity("types")
export class TypeEntity implements Type {

  @PrimaryGeneratedColumn({ zerofill: true })
  id: number;

  @Index({ unique: true })
  @Column("varchar")
  code: string;

  @Index()
  @Column("varchar", { nullable: true })
  name: string;

  @Column("text", { nullable: true })
  description: string;

  @ManyToOne(t => TypeCategoryEntity, c => c.code)
  category: TypeCategoryEntity;

  @ManyToOne(t => MediaEntity, t => t.code)
  image: MediaEntity;

}
