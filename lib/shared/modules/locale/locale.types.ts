import { Media } from "../../../common/media/media.types";

/**
 * Interface represents a language entity.
 */
export interface Language {
  id: string;
  name: string;
  icon: Media;
}
/**
 * Interface represents a localized string entity.
 */
export interface LocalizedString {
  id: number;
  code: string;
  lang: Language;
  value: string;
}

/**
 * Interface represents a localized media entity.
 */
export interface LocalizedMedia {
  id: number;
  code: string;
  lang: Language;
  value: Media;
}
