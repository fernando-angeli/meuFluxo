import type { Locale, TranslationKey } from "./types";
import { ptBR } from "./dictionaries/pt-BR";
import { en } from "./dictionaries/en";
import { es } from "./dictionaries/es";

const dictionaries: Record<Locale, Record<TranslationKey, string>> = {
  "pt-BR": ptBR,
  en,
  es,
};

/**
 * Retorna o dicionário do idioma. Usado pelo provider e para SSR.
 */
export function getDictionary(locale: Locale): Record<TranslationKey, string> {
  return dictionaries[locale] ?? dictionaries["pt-BR"];
}

/**
 * Traduz uma chave para o idioma. Retorna a chave se a tradução não existir.
 */
export function translate(
  locale: Locale,
  key: TranslationKey,
): string {
  const dict = getDictionary(locale);
  return dict[key] ?? key;
}

export type { Locale, TranslationKey } from "./types";
export { LOCALES, LOCALE_LABELS } from "./types";
export { I18nProvider, useTranslation, useLocale } from "./context";
