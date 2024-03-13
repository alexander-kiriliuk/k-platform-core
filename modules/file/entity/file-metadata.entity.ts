import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { FileMetadata } from "../file.types";
import { IccFileMetadataEntity } from "@files/entity/icc-file-metadata.entity";
import { GpsFileMetadataEntity } from "@files/entity/gps-file-metadata.entity";
import { ImageFileMetadataEntity } from "@files/entity/image-file-metadata.entity";
import { ExifFileMetadataEntity } from "@files/entity/exif-file-metadata.entity";
import { AudioFileMetadataEntity } from "@files/entity/audio-file-metadata.entity";
import { VideoFileMetadataEntity } from "@files/entity/video-file-metadata.entity";

@Entity("file_metadata")
export class FileMetadataEntity implements FileMetadata {

  @PrimaryGeneratedColumn({ zerofill: true })
  id: number;

  @Column("varchar", { nullable: true })
  mime: string;

  @Column("varchar", { nullable: true })
  ext: string;

  @Column("varchar", { nullable: true })
  hash: string;

  @OneToOne(() => ImageFileMetadataEntity, (t) => t.id, {
    cascade: true,
    onDelete: "CASCADE"
  })
  @JoinColumn()
  image: ImageFileMetadataEntity;

  @OneToOne(() => GpsFileMetadataEntity, (t) => t.id, {
    cascade: true,
    onDelete: "CASCADE"
  })
  @JoinColumn()
  gps: GpsFileMetadataEntity;

  @OneToOne(() => IccFileMetadataEntity, (t) => t.id, {
    cascade: true,
    onDelete: "CASCADE"
  })
  @JoinColumn()
  icc: IccFileMetadataEntity;

  @OneToOne(() => ExifFileMetadataEntity, (t) => t.id, {
    cascade: true,
    onDelete: "CASCADE"
  })
  @JoinColumn()
  exif: ExifFileMetadataEntity;

  @OneToOne(() => AudioFileMetadataEntity, (t) => t.id, {
    cascade: true,
    onDelete: "CASCADE"
  })
  @JoinColumn()
  audio: AudioFileMetadataEntity;

  @OneToOne(() => VideoFileMetadataEntity, (t) => t.id, {
    cascade: true,
    onDelete: "CASCADE"
  })
  @JoinColumn()
  video: VideoFileMetadataEntity;

}
