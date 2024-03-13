import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";
import { ImageFileMetadata } from "@files/file.types";

@Entity("file_metadata_image")
export class ImageFileMetadataEntity implements ImageFileMetadata {

  @PrimaryGeneratedColumn({ zerofill: true })
  id: number;

  @Index()
  @Column("int", { nullable: true, default: null })
  bps: number;

  @Index()
  @Column("int", { nullable: true, default: null })
  width: number;

  @Index()
  @Column("int", { nullable: true, default: null })
  height: number;

  @Index()
  @Column("int", { name: "color_components", nullable: true, default: null })
  colorComponents: number;

  @Index()
  @Column("varchar", { nullable: true })
  subsampling: string;

  @Index()
  @Column("datetime", { name: "date_time", nullable: true })
  dateTime: Date;

  @Index()
  @Column("varchar", { nullable: true })
  bitDepth: number;

  @Index()
  @Column("varchar", { nullable: true })
  colorType: string;

  @Index()
  @Column("varchar", { nullable: true })
  compression: string;

  @Index()
  @Column("varchar", { nullable: true })
  filter: string;

  @Index()
  @Column("varchar", { nullable: true })
  interlace: string;

}
