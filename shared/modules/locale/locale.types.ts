import { Media } from "@media/media.types";

export interface Language {
  id: string;
  name: string;
  icon: Media;
}

export interface LocalizedString {
  id: number;
  code: string;
  lang: Language;
  value: string;
}

export interface LocalizedMedia {
  id: number;
  code: string;
  lang: Language;
  value: Media;
}
