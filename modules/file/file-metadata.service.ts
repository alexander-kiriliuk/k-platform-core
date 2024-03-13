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


import { Injectable } from "@nestjs/common";
import { parseBuffer } from "music-metadata";
import { AudioFileMetadataEntity } from "@files/entity/audio-file-metadata.entity";
import { VideoFileMetadataEntity } from "@files/entity/video-file-metadata.entity";
import { FilesUtils } from "@shared/utils/files.utils";
import { FileMetadataEntity } from "@files/entity/file-metadata.entity";
import { ImageFileMetadataEntity } from "@files/entity/image-file-metadata.entity";
import { GpsFileMetadataEntity } from "@files/entity/gps-file-metadata.entity";
import { IccFileMetadataEntity } from "@files/entity/icc-file-metadata.entity";
import { ExifFileMetadataEntity } from "@files/entity/exif-file-metadata.entity";
import * as ExifReader from "exifreader";
import * as ffprobe from "ffprobe";
import * as ffprobeStatic from "ffprobe-static";
import { FileMd } from "@files/file.constants";
import getHashFromBuffer = FilesUtils.getHashFromBuffer;
import fileType = FilesUtils.fileType;


@Injectable()
export class FileMetadataService extends FileMd {

  async createFileMetadataEntity(buf: Buffer, filePath?: string) {
    const fileTypeData = await fileType().fileTypeFromBuffer(buf);
    const md = new FileMetadataEntity();
    md.hash = getHashFromBuffer(buf);
    if (fileTypeData) {
      md.mime = fileTypeData.mime;
      md.ext = fileTypeData.ext;
    } else {
      return md;
    }
    try {
      if (md.mime.startsWith("image")) {
        this.setImageMd(md, buf);
      } else if (md.mime.startsWith("audio")) {
        await this.setAudioMd(md, buf);
      } else if (md.mime.startsWith("video")) {
        await this.setVideoMd(md, filePath);
      }
    } catch (e) {
    }
    return md;
  }

  private async setVideoMd(md: FileMetadataEntity, filePath: string) {
    if (filePath) {
      const ffProbeMd = await ffprobe(filePath, { path: ffprobeStatic.path });
      if (ffProbeMd) {
        const audioMd = ffProbeMd.streams.find(v => v.codec_type === "audio");
        if (audioMd) {
          md.audio = new AudioFileMetadataEntity();
          md.audio.container = audioMd.codec_name?.toUpperCase();
          md.audio.codec = audioMd.codec_long_name;
          md.audio.duration = parseFloat(audioMd.duration || 0);
          md.audio.numberOfChannels = audioMd.channels;
          md.audio.bitrate = audioMd.bit_rate;
        }
        const videoMd = ffProbeMd.streams.find(v => v.codec_type === "video");
        if (videoMd) {
          md.video = new VideoFileMetadataEntity();
          md.video.codec = videoMd.codec_name?.toUpperCase();
          md.video.container = videoMd.codec_long_name;
          md.video.width = videoMd.width;
          md.video.height = videoMd.height;
          md.video.bitrate = videoMd.bit_rate;
          md.video.duration = parseFloat(videoMd.duration || 0);
          md.video.sampleAspectRatio = videoMd.sample_aspect_ratio;
          md.video.displayAspectRatio = videoMd.display_aspect_ratio;
          md.video.colorRange = videoMd.color_range;
          md.video.colorSpace = videoMd.color_space;
          md.video.frameRate = videoMd.r_frame_rate;
          md.video.rotate = videoMd.tags?.rotate;
        }
      }
    }
  }

  private async setAudioMd(md: FileMetadataEntity, buf: Buffer) {
    const musicMd = await parseBuffer(buf);
    if (!musicMd) {
      return;
    }
    md.audio = new AudioFileMetadataEntity();
    md.audio.container = musicMd.format.container;
    md.audio.codec = musicMd.format.codec;
    md.audio.sampleRate = musicMd.format.sampleRate;
    md.audio.numberOfChannels = musicMd.format.numberOfChannels;
    md.audio.bitrate = musicMd.format.bitrate;
    md.audio.codecProfile = musicMd.format.codecProfile;
    md.audio.tool = musicMd.format.tool;
    md.audio.duration = musicMd.format.duration;
    md.audio.title = musicMd.common.title;
    md.audio.album = musicMd.common.album;
    md.audio.artist = musicMd.common.artists?.join(", ");
    md.audio.year = musicMd.common.year;
    md.audio.genre = musicMd.common.genre?.join(", ");
    md.audio.label = musicMd.common.label?.join(", ");
  }

  private setImageMd(md: FileMetadataEntity, buf: Buffer) {
    const exifData = ExifReader.load(buf, { expanded: true, includeUnknown: true });
    if (!exifData) {
      return;
    }
    md.image = new ImageFileMetadataEntity();
    md.image.bps = exifData.file["Bits Per Sample"]?.value;
    md.image.height = exifData.file["Image Height"]?.value;
    md.image.width = exifData.file["Image Width"]?.value;
    md.image.colorComponents = exifData.file["Color Components"]?.value;
    md.image.subsampling = exifData.file["Subsampling"]?.description;
    if (exifData.png) {
      md.image.height = exifData.png["Image Height"]?.value;
      md.image.width = exifData.png["Image Width"]?.value;
      md.image.bitDepth = exifData.png["Bit Depth"]?.value;
      md.image.colorType = exifData.png["Color Type"]?.description;
      md.image.compression = exifData.png["Compression"]?.description;
      md.image.filter = exifData.png["Filter"]?.description;
      md.image.interlace = exifData.png["Interlace"]?.description;
    }
    if (exifData.gps) {
      md.gps = new GpsFileMetadataEntity();
      md.gps.altitude = exifData.gps?.Altitude;
      md.gps.longitude = exifData.gps?.Longitude;
      md.gps.latitude = exifData.gps?.Latitude;
    }
    if (exifData.icc) {
      md.icc = new IccFileMetadataEntity();
      md.icc.preferredCmmType = exifData.icc["Preferred CMM type"]?.description;
      md.icc.profileVersion = exifData.icc["Profile Version"]?.description;
      md.icc.profileClassName = exifData.icc["Profile/Device class"]?.description;
      md.icc.profileClassValue = exifData.icc["Profile/Device class"]?.value;
      md.icc.connectionSpace = exifData.icc["Connection Space"]?.description;
      md.icc.iccProfileDate = new Date(exifData.icc["ICC Profile Date"]?.value);
      if (exifData.icc["ICC Profile Date"]?.value) {
        md.image.dateTime = md.icc.iccProfileDate;
      }
      md.icc.iccSignature = exifData.icc["ICC Signature"]?.description;
      md.icc.primaryPlatform = exifData.icc["Primary Platform"]?.description;
      md.icc.deviceManufacturer = exifData.icc["Device Manufacturer"]?.description;
      md.icc.deviceModelNumber = exifData.icc["Device Model Number"]?.description;
      md.icc.renderingIntentName = exifData.icc["Rendering Intent"]?.description;
      md.icc.renderingIntentValue = exifData.icc["Rendering Intent"]?.value;
      md.icc.profileCreator = exifData.icc["Profile Creator"]?.description;
      md.icc.iccDescription = exifData.icc["ICC Description"]?.description;
      md.icc.iccCopyright = exifData.icc["ICC Copyright"]?.description;
    }
    if (exifData.exif) {
      md.exif = new ExifFileMetadataEntity();
      md.exif.make = exifData.exif.Make?.description;
      md.exif.model = exifData.exif.Model?.description;
      md.exif.orientation = exifData.exif.Orientation?.description;
      md.exif.resolutionX = exifData.exif.XResolution?.description;
      md.exif.resolutionY = exifData.exif.YResolution?.description;
      md.exif.resolutionUnit = exifData.exif.ResolutionUnit?.description;
      md.exif.software = exifData.exif.Software?.description;
      md.exif.ycbCrPositioning = exifData.exif.YCbCrPositioning?.description;
      md.exif.exifIfdPointer = exifData.exif["Exif IFD Pointer"]?.description;
      md.exif.gpsInfoIfdPointer = exifData.exif["GPS Info IFD Pointer"]?.description;
      md.exif.exposureTime = exifData.exif.ExposureTime?.description;
      md.exif.fNumber = exifData.exif.FNumber?.description;
      md.exif.exposureProgram = exifData.exif.ExposureProgram?.description;
      md.exif.isoSpeedRatings = exifData.exif.ISOSpeedRatings?.description;
      md.exif.exifVersion = exifData.exif.ExifVersion?.description;
      md.exif.offsetTime = exifData.exif.OffsetTime?.description;
      md.exif.shutterSpeedValue = exifData.exif.ShutterSpeedValue?.description;
      md.exif.aperture = exifData.exif.ApertureValue?.description;
      md.exif.brightness = exifData.exif.BrightnessValue?.description;
      md.exif.exposureBias = exifData.exif.ExposureBiasValue?.description;
      md.exif.maxAperture = exifData.exif.MaxApertureValue?.description;
      md.exif.subjectDistance = exifData.exif.SubjectDistance?.description;
      md.exif.meteringMode = exifData.exif.MeteringMode?.description;
      md.exif.flash = exifData.exif.Flash?.description;
      md.exif.focalLength = exifData.exif.FocalLength?.description;
      md.exif.subSecTime = exifData.exif.SubSecTime?.description;
      md.exif.flashpixVersion = exifData.exif.FlashpixVersion?.description;
      md.exif.colorSpace = exifData.exif.ColorSpace?.description;
      md.exif.pixelXDimension = exifData.exif.PixelXDimension?.description;
      md.exif.pixelYDimension = exifData.exif.PixelYDimension?.description;
      md.exif.interoperabilityIfdPointer = exifData.exif["Interoperability IFD Pointer"]?.description;
      md.exif.sensingMethod = exifData.exif.SensingMethod?.description;
      md.exif.sceneType = exifData.exif.SceneType?.description;
      md.exif.customRendered = exifData.exif.CustomRendered?.description;
      md.exif.exposureMode = exifData.exif.ExposureMode?.description;
      md.exif.whiteBalance = exifData.exif.WhiteBalance?.description;
      md.exif.digitalZoomRatio = exifData.exif.DigitalZoomRatio?.description;
      md.exif.sceneCaptureType = exifData.exif.SceneCaptureType?.description;
      md.exif.contrast = exifData.exif.Contrast?.description;
      md.exif.saturation = exifData.exif.Saturation?.description;
      md.exif.sharpness = exifData.exif.Sharpness?.description;
      md.exif.subjectDistanceRange = exifData.exif.SubjectDistanceRange?.description;
      md.exif.lensMake = exifData.exif.LensMake?.description;
      md.exif.lensModel = exifData.exif.LensModel?.description;
      md.exif.compositeImage = exifData.exif["CompositeImage"]?.description;
      md.exif.interoperabilityIndex = exifData.exif.InteroperabilityIndex?.description;
      md.exif.interoperabilityVersion = exifData.exif["InteroperabilityVersion"]?.description;
    }
  }

}