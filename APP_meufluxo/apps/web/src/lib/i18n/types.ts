import type { PtBRKeys } from "./dictionaries/pt-BR";

export type Locale = "pt-BR" | "en" | "es";

/** Chave de tradução (todas as chaves do dicionário PT-BR). */
export type TranslationKey = PtBRKeys;

export const LOCALES: Locale[] = ["pt-BR", "en", "es"];

export const LOCALE_LABELS: Record<Locale, string> = {
  "pt-BR": "Português (Brasil)",
  en: "English",
  es: "Español",
};
