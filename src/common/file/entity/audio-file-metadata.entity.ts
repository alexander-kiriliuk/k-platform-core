import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";
import { AudioFileMetadata } from "../file.types";

@Entity("file_metadata_audio")
export class AudioFileMetadataEntity implements AudioFileMetadata {
  @PrimaryGeneratedColumn({ zerofill: true })
  id: number;

  @Index()
  @Column("varchar", { nullable: true })
  container: string;

  @Index()
  @Column("varchar", { nullable: true })
  codec: string;

  @Index()
  @Column("int", { name: "sample_rate", nullable: true })
  sampleRate: number;

  @Index()
  @Column("int", { name: "number_of_channels", nullable: true })
  numberOfChannels: number;

  @Index()
  @Column("int", { nullable: true })
  bitrate: number;

  @Index()
  @Column("varchar", { name: "codec_profile", nullable: true })
  codecProfile: string;

  @Index()
  @Column("varchar", { nullable: true })
  tool: string;

  @Index()
  @Column("decimal", {
    nullable: true,
    default: null,
    precision: 15,
    scale: 10
  })
  duration: number;

  @Index()
  @Column("varchar", { nullable: true })
  title: string;

  @Index()
  @Column("varchar", { nullable: true })
  artist: string;

  @Index()
  @Column("varchar", { nullable: true })
  album: string;

  @Index()
  @Column("int", { nullable: true })
  year: number;

  @Index()
  @Column("varchar", { nullable: true })
  genre: string;

  @Index()
  @Column("varchar", { nullable: true })
  label: string;
}
