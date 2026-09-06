import { ar, type Dictionary } from "./dictionaries/ar";
import { en } from "./dictionaries/en";

export type Locale = "ar" | "en";

export const LOCALES: Locale[] = ["ar", "en"];
export const DEFAULT_LOCALE: Locale = "ar";

export function isValidLocale(locale: string): locale is Locale {
    return LOCALES.includes(locale as Locale);
}

export function getDirection(locale: Locale): "rtl" | "ltr" {
    return locale === "ar" ? "rtl" : "ltr";
}

export function getDictionary(locale: Locale): Dictionary {
    return locale === "en" ? en : ar;
}

export type { Dictionary };

