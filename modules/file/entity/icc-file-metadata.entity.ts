import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";
import { IccFileMetadata } from "@files/file.types";

@Entity("file_metadata_icc")
export class IccFileMetadataEntity implements IccFileMetadata {

  @PrimaryGeneratedColumn({ zerofill: true })
  id: number;

  @Index()
  @Column("varchar", { name: "profile_version", nullable: true })
  profileVersion: string;

  @Index()
  @Column("varchar", { name: "profile_class_value", nullable: true })
  profileClassValue: string;

  @Index()
  @Column("varchar", { name: "profile_class_name", nullable: true })
  profileClassName: string;

  @Index()
  @Column("varchar", { name: "connection_space", nullable: true })
  connectionSpace: string;

  @Index()
  @Column("date", { name: "icc_profile_date", nullable: true })
  iccProfileDate: Date;

  @Index()
  @Column("varchar", { name: "icc_signature", nullable: true })
  iccSignature: string;

  @Index()
  @Column("varchar", { name: "primary_platform", nullable: true })
  primaryPlatform: string;

  @Index()
  @Column("varchar", { name: "device_manufacturer", nullable: true })
  deviceManufacturer: string;

  @Index()
  @Column("varchar", { name: "device_model_number", nullable: true })
  deviceModelNumber: string;

  @Index()
  @Column("int", { name: "rendering_intent_value", nullable: true })
  renderingIntentValue: string;

  @Index()
  @Column("varchar", { name: "rendering_intent_name", nullable: true })
  renderingIntentName: string;

  @Index()
  @Column("varchar", { name: "profile_creator", nullable: true })
  profileCreator: string;

  @Index()
  @Column("varchar", { name: "icc_description", nullable: true })
  iccDescription: string;

  @Index()
  @Column("varchar", { name: "icc_copyright", nullable: true })
  iccCopyright: string;

}
