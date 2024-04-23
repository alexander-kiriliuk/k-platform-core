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

import { Media } from "@media/media.types";
import { Type as Class } from "@nestjs/common/interfaces/type.interface";
import { FileManager, FileMd } from "@files/file.constants";

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

export interface FileMetadata {
  id: number;
  mime: string;
  ext: string;
  hash: string;
  icc: IccFileMetadata;
  gps: GpsFileMetadata;
  image: ImageFileMetadata;
  exif: ExifFileMetadata;
  audio: AudioFileMetadata;
  video: VideoFileMetadata;
}

export interface ImageFileMetadata {
  id: number;
  bps: number;
  width: number;
  height: number;
  colorComponents: number;
  subsampling: string;
  dateTime: Date;
  bitDepth: number;
  colorType: string;
  compression: string;
  filter: string;
  interlace: string;
}

export interface IccFileMetadata {
  id: number;
  profileVersion: string;
  profileClassValue: string;
  profileClassName: string;
  connectionSpace: string;
  iccProfileDate: Date;
  iccSignature: string;
  primaryPlatform: string;
  deviceManufacturer: string;
  deviceModelNumber: string;
  renderingIntentValue: string;
  renderingIntentName: string;
  profileCreator: string;
  iccDescription: string;
  iccCopyright: string;
}

export interface ExifFileMetadata {
  id: number;
  make: string;
  model: string;
  orientation: string;
  resolutionX: string;
  resolutionY: string;
  resolutionUnit: string;
  software: string;
  ycbCrPositioning: string;
  exifIfdPointer: string;
  gpsInfoIfdPointer: string;
  exposureTime: string;
  fNumber: string;
  exposureProgram: string;
  isoSpeedRatings: string;
  exifVersion: string;
  offsetTime: string;
  shutterSpeedValue: string;
  aperture: string;
  brightness: string;
  exposureBias: string;
  maxAperture: string;
  subjectDistance: string;
  meteringMode: string;
  flash: string;
  focalLength: string;
  flashpixVersion: string;
  colorSpace: string;
  pixelXDimension: string;
  pixelYDimension: string;
  interoperabilityIfdPointer: string;
  sensingMethod: string;
  sceneType: string;
  customRendered: string;
  exposureMode: string;
  whiteBalance: string;
  digitalZoomRatio: string;
  sceneCaptureType: string;
  contrast: string;
  saturation: string;
  sharpness: string;
  subjectDistanceRange: string;
  lensMake: string;
  lensModel: string;
  compositeImage: string;
  interoperabilityIndex: string;
  interoperabilityVersion: string;
}

export interface GpsFileMetadata {
  id: number;
  latitude: number;
  longitude: number;
  altitude: number;
}

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

export type FileModuleOptions = {
  fileManager: Class<FileManager>;
  fileMd: Class<FileMd>;
};
