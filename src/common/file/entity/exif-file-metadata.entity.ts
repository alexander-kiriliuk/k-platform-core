import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";
import { ExifFileMetadata } from "../file.types";

@Entity("file_metadata_exif")
export class ExifFileMetadataEntity implements ExifFileMetadata {

  @PrimaryGeneratedColumn({ zerofill: true })
  id: number;

  @Index()
  @Column("varchar", { nullable: true })
  make: string;

  @Index()
  @Column("varchar", { nullable: true })
  model: string;

  @Index()
  @Column("varchar", { nullable: true })
  orientation: string;

  @Index()
  @Column("varchar", { name: "resolution_x", nullable: true })
  resolutionX: string;

  @Index()
  @Column("varchar", { name: "resolution_y", nullable: true })
  resolutionY: string;

  @Index()
  @Column("varchar", { name: "resolution_unit", nullable: true })
  resolutionUnit: string;

  @Index()
  @Column("varchar", { nullable: true })
  software: string;

  @Index()
  @Column("varchar", { name: "ycb_cr_positioning", nullable: true })
  ycbCrPositioning: string;

  @Index()
  @Column("varchar", { name: "exif_ifd_pointer", nullable: true })
  exifIfdPointer: string;

  @Index()
  @Column("varchar", { name: "gps_info_ifd_pointer", nullable: true })
  gpsInfoIfdPointer: string;

  @Index()
  @Column("varchar", { name: "exposure_time", nullable: true })
  exposureTime: string;

  @Index()
  @Column("varchar", { name: "f_number", nullable: true })
  fNumber: string;

  @Index()
  @Column("varchar", { name: "exposure_program", nullable: true })
  exposureProgram: string;

  @Index()
  @Column("varchar", { name: "iso_speed_ratings", nullable: true })
  isoSpeedRatings: string;

  @Index()
  @Column("varchar", { name: "exif_version", nullable: true })
  exifVersion: string;

  @Index()
  @Column("varchar", { name: "offset_time", nullable: true })
  offsetTime: string;

  @Index()
  @Column("varchar", { name: "shutterSpeedValue", nullable: true })
  shutterSpeedValue: string;

  @Index()
  @Column("varchar", { nullable: true })
  aperture: string;

  @Index()
  @Column("varchar", { nullable: true })
  brightness: string;

  @Index()
  @Column("varchar", { name: "exposure_bias", nullable: true })
  exposureBias: string;

  @Index()
  @Column("varchar", { name: "max_aperture", nullable: true })
  maxAperture: string;

  @Index()
  @Column("varchar", { name: "subject_distance", nullable: true })
  subjectDistance: string;

  @Index()
  @Column("varchar", { name: "metering_mode", nullable: true })
  meteringMode: string;

  @Index()
  @Column("varchar", { nullable: true })
  flash: string;

  @Index()
  @Column("varchar", { name: "focal_length", nullable: true })
  focalLength: string;

  @Index()
  @Column("varchar", { name: "flashpix_version", nullable: true })
  flashpixVersion: string;

  @Index()
  @Column("varchar", { name: "color_space", nullable: true })
  colorSpace: string;

  @Index()
  @Column("varchar", { name: "pixel_x_dimension", nullable: true })
  pixelXDimension: string;

  @Index()
  @Column("varchar", { name: "pixel_y_dimension", nullable: true })
  pixelYDimension: string;

  @Index()
  @Column("varchar", { name: "interoperability_ifd_pointer", nullable: true })
  interoperabilityIfdPointer: string;

  @Index()
  @Column("varchar", { name: "sensing_method", nullable: true })
  sensingMethod: string;

  @Index()
  @Column("varchar", { name: "scene_type", nullable: true })
  sceneType: string;

  @Index()
  @Column("varchar", { name: "custom_rendered", nullable: true })
  customRendered: string;

  @Index()
  @Column("varchar", { name: "exposure_mode", nullable: true })
  exposureMode: string;

  @Index()
  @Column("varchar", { name: "white_balance", nullable: true })
  whiteBalance: string;

  @Index()
  @Column("varchar", { name: "digital_zoom_ratio", nullable: true })
  digitalZoomRatio: string;

  @Index()
  @Column("varchar", { name: "scene_capture_type", nullable: true })
  sceneCaptureType: string;

  @Index()
  @Column("varchar", { nullable: true })
  contrast: string;

  @Index()
  @Column("varchar", { nullable: true })
  saturation: string;

  @Index()
  @Column("varchar", { nullable: true })
  sharpness: string;

  @Index()
  @Column("varchar", { name: "subject_distance_range", nullable: true })
  subjectDistanceRange: string;

  @Index()
  @Column("varchar", { name: "lens_make", nullable: true })
  lensMake: string;

  @Index()
  @Column("varchar", { name: "lens_model", nullable: true })
  lensModel: string;

  @Index()
  @Column("varchar", { name: "composite_image", nullable: true })
  compositeImage: string;

  @Index()
  @Column("varchar", { name: "interoperability_index", nullable: true })
  interoperabilityIndex: string;

  @Index()
  @Column("varchar", { name: "interoperability_version", nullable: true })
  interoperabilityVersion: string;

}
