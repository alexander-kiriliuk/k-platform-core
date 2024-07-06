import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";
import { GpsFileMetadata } from "../file.types";

/**
 * The entity stores the GPS metadata of the file
 */
@Entity("file_metadata_gps")
export class GpsFileMetadataEntity implements GpsFileMetadata {
  @PrimaryGeneratedColumn({ zerofill: true })
  id: number;

  @Index()
  @Column("decimal", {
    nullable: true,
    default: null,
    precision: 15,
    scale: 10,
  })
  altitude: number;

  @Index()
  @Column("decimal", {
    nullable: true,
    default: null,
    precision: 15,
    scale: 10,
  })
  latitude: number;

  @Index()
  @Column("decimal", {
    nullable: true,
    default: null,
    precision: 15,
    scale: 10,
  })
  longitude: number;
}
