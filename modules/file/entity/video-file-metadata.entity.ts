import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";
import { VideoFileMetadata } from "@files/file.types";

@Entity("file_metadata_video")
export class VideoFileMetadataEntity implements VideoFileMetadata {

  @PrimaryGeneratedColumn({ zerofill: true })
  id: number;

  @Index()
  @Column("varchar", { nullable: true })
  codec: string;

  @Index()
  @Column("varchar", { nullable: true })
  container: string;

  @Index()
  @Column("int", { nullable: true, default: null })
  width: number;

  @Index()
  @Column("int", { nullable: true, default: null })
  height: number;

  @Index()
  @Column("int", { nullable: true })
  bitrate: number;

  @Index()
  @Column("decimal", { nullable: true, default: null, precision: 15, scale: 10 })
  duration: number;

  @Index()
  @Column("varchar", { name: "sample_aspect_ratio", nullable: true })
  sampleAspectRatio: string;

  @Index()
  @Column("varchar", { name: "display_aspect_ratio", nullable: true })
  displayAspectRatio: string;

  @Index()
  @Column("varchar", { name: "color_range", nullable: true })
  colorRange: string;

  @Index()
  @Column("varchar", { name: "color_space", nullable: true })
  colorSpace: string;

  @Index()
  @Column("varchar", { name: "frame_rate", nullable: true })
  frameRate: string;

  @Index()
  @Column("varchar", { nullable: true })
  rotate: string;

}
