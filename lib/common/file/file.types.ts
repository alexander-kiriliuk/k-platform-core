/*
 * Copyright 2023 Alexander Kiriliuk
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

import { Type as Class } from "@nestjs/common/interfaces/type.interface";
import { Media } from "../media/media.types";
import { FileManager, FileMd } from "./file.constants";

/**
 * Interface representing a file.
 */
export interface File {
  id: number;
  code: string;
  name: string;
  path: string;
  public: boolean;
  size: number;
  icon: Media;
  preview: Media;
  metadata: FileMetadata;
  tsCreated: Date;
}

/**
 * Interface representing file metadata.
 */
export interface FileMetadata {
  /** This field contains the identification number */
  id: number;
  /** The MIME type of the file, indicating the nature and format of the file content */
  mime: string;
  /** The file extension, indicating the file format */
  ext: string;
  /** The cryptographic hash of the file content, used for integrity verification and identification */
  hash: string;
  /** The ICC (International Color Consortium) profile data associated with the file, used for color management */
  icc: IccFileMetadata;
  /** GPS data associated with the location where the file was created, including latitude, longitude and elevation */
  gps: GpsFileMetadata;
  /** This field is used to store information about the structure and characteristics of the image, such as size, resolution, color depth, and other image characteristics */
  image: ImageFileMetadata;
  /** This is EXIF (Exchangeable Image File Format) data, which includes various metadata that was recorded by the camera or device when the image was created */
  exif: ExifFileMetadata;
  /** This field is used to store information about the structure and properties of the audio file */
  audio: AudioFileMetadata;
  /** This field is used to store information about the structure and properties of the video recording*/
  video: VideoFileMetadata;
}

/**
 * Interface representing image file metadata.
 */
export interface ImageFileMetadata {
  /** This field contains the identification number */
  id: number;
  /** The number of bits used to represent the color of a single pixel in the image */
  bps: number;
  /** The width of the image in pixels */
  width: number;
  /** The height of the image in pixels */
  height: number;
  /** The number of color components used to represent the color of the image */
  colorComponents: number;
  /** The subsampling method used for the image, indicating how color information is sampled */
  subsampling: string;
  /** The date and time when the image was created or last modified */
  dateTime: Date;
  /** The bit depth of the image, indicating the number of bits used for color representation */
  bitDepth: number;
  /** The color type of the image, indicating the color model used */
  colorType: string;
  /** Contains the compression method used to reduce the size of the image */
  compression: string;
  /** Specifies the filtering method used to process the image data before compressing it */
  filter: string;
  /**  Indicates whether interlacing is used in the image, allowing for progressive display */
  interlace: string;
}

/**
 * Interface representing ICC file metadata.
 */
export interface IccFileMetadata {
  /** This field contains the identification number */
  id: number;
  /** The version of the ICC profile, indicating the specification version used to create the color profile. */
  profileVersion: string;
  /** The class of the ICC profile, indicating its primary purpose and type */
  profileClassValue: string;
  /** The name of the ICC profile class, describing its primary purpose */
  profileClassName: string;
  /** The connection space of the ICC profile, representing the intermediate color space used for color conversions. */
  connectionSpace: string;
  /** The date and time when the ICC profile was created or last modified */
  iccProfileDate: Date;
  /** A unique signature of the ICC profile used to confirm its authenticity and validity */
  iccSignature: string;
  /** The primary platform or operating system for which the ICC profile was created or optimized */
  primaryPlatform: string;
  /** The manufacturer of the device for which the ICC profile was created */
  deviceManufacturer: string;
  /** The model number of the device for which the ICC profile was created */
  deviceModelNumber: string;
  /**  Indicates the type of rendering to be used when converting colors between color spaces */
  renderingIntentValue: string;
  /** Specifies the name of the rendering type that is used when converting colors between color spaces */
  renderingIntentName: string;
  /** The name or identifier of the creator of the ICC profile */
  profileCreator: string;
  /** A description of the ICC profile, explaining its purpose and characteristics */
  iccDescription: string;
  /** The copyright information for the ICC profile, indicating ownership and usage rights */
  iccCopyright: string;
}

/**
 * Interface representing EXIF file metadata.
 */
export interface ExifFileMetadata {
  /** This field contains the identification number */
  id: number;
  /** This field specifies the manufacturer of the camera */
  make: string;
  /** This field specifies the model of the camera  */
  model: string;
  /** Indicates image display orientation based on EXIF metadata */
  orientation: string;
  /** X-side resolution of the photo*/
  resolutionX: string;
  /** Y-side resolution of the photo*/
  resolutionY: string;
  /** Unit of image resolution */
  resolutionUnit: string;
  /** The field contains information about the software that was used to create or edit the image */
  software: string;
  /** This field is responsible for specifying the method of placing these color components Y, Cb and Cr relative to the image pixels */
  ycbCrPositioning: string;
  /** Pointer to the beginning of an EXIF IFD block in a file inside a TIFF file */
  exifIfdPointer: string;
  /** Contains information about the location where the image was taken */
  gpsInfoIfdPointer: string;
  /** Exposure time (shutter speed) when capturing an image */
  exposureTime: string;
  /** Contains data on the aperture number (aperture) when capturing an image */
  fNumber: string;
  /** Contains data on the exposure mode (shutter speed and aperture) used to capture the image */
  exposureProgram: string;
  /** Contains data on the ISO value (the sensitivity of the camera sensor to light) */
  isoSpeedRatings: string;
  /** Contains EXIF specification version data */
  exifVersion: string;
  /** Contains time offset data relative to UTC (Coordinated Universal Time) for the date and time when the image was taken */
  offsetTime: string;
  /** Contains data on the shutter speed of the camera */
  shutterSpeedValue: string;
  /** Contains data on the aperture (aperture) value used to capture the image */
  aperture: string;
  /** Contains data on the brightness level of the image */
  brightness: string;
  /** Contains exposure compensation data  */
  exposureBias: string;
  /** Contains data on the maximum aperture (aperture) value  */
  maxAperture: string;
  /** Contains data on the distance to the subject in millimeters */
  subjectDistance: string;
  /** Contains data on the light sensing mode used by the camera when capturing an image */
  meteringMode: string;
  /** Contains data on the status and operation of the flash during image capture */
  flash: string;
  /** Contains data about the focal length of the camera lens */
  focalLength: string;
  /** The Flashpix format version used for the image */
  flashpixVersion: string;
  /** The color space of the image data */
  colorSpace: string;
  /** Width (horizontal resolution) of the image in pixels */
  pixelXDimension: string;
  /** Contains data about the vertical resolution (height) of the image in pixels */
  pixelYDimension: string;
  /** Pointer to the start of the Interoperability IFD block for compatibility metadata */
  interoperabilityIfdPointer: string;
  /** Indicates the method used by the camera sensor to capture the image */
  sensingMethod: string;
  /** The type of scene captured in the image, indicating if it was taken with a digital camera */
  sceneType: string;
  /** Indicates whether the image was processed with custom rendering */
  customRendered: string;
  /** The exposure mode used by the camera during the shot */
  exposureMode: string;
  /** The white balance setting used during the shot */
  whiteBalance: string;
  /** The digital zoom ratio applied during the shot */
  digitalZoomRatio: string;
  /** The type of scene capture mode used during the shot */
  sceneCaptureType: string;
  /** The level of contrast applied to the image */
  contrast: string;
  /** The level of color saturation applied to the image */
  saturation: string;
  /** The level of sharpness applied to the image */
  sharpness: string;
  /** The distance range to the subject during the shot */
  subjectDistanceRange: string;
  /** The manufacturer of the lens used to capture the image */
  lensMake: string;
  /** The model of the lens used to capture the image */
  lensModel: string;
  /** Indicates whether the image is a composite, created by combining multiple images or applying effects */
  compositeImage: string;
  /** The interoperability index indicating the standard used for ensuring image compatibility */
  interoperabilityIndex: string;
  /** The version of the interoperability standard used for the image */
  interoperabilityVersion: string;
}

/**
 * Interface representing GPS file metadata.
 */
export interface GpsFileMetadata {
  /** Representing identifier of meta-data object */
  id: number;
  /** Representing gps-latitude parameter */
  latitude: number;
  /** Representing gps-longitude parameter */
  longitude: number;
  /** Representing gps-altitude parameter */
  altitude: number;
}

/**
 * Interface representing video file metadata.
 */
export interface VideoFileMetadata {
  id: number;
  codec: string;
  container: string;
  width: number;
  height: number;
  bitrate: number;
  duration: number;
  sampleAspectRatio: string;
  displayAspectRatio: string;
  colorRange: string;
  colorSpace: string;
  frameRate: string;
  rotate: string;
}

/**
 * Interface representing audio file metadata.
 */
export interface AudioFileMetadata {
  id: number;
  container: string;
  codec: string;
  sampleRate: number;
  numberOfChannels: number;
  bitrate: number;
  codecProfile: string;
  tool: string;
  duration: number;
  title: string;
  artist: string;
  album: string;
  year: number;
  genre: string;
  label: string;
}

/**
 * Options for configuring the FileModule.
 */
export type FileModuleOptions = {
  fileManager: Class<FileManager>;
  fileMd: Class<FileMd>;
};
