"use client";

import * as React from "react";
import { useAuthOptional } from "@/hooks/useAuth";
import { getDictionary } from "./index";
import type { Locale, TranslationKey } from "./types";

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
};

const I18nContext = React.createContext<I18nContextValue | null>(null);

function applyDocumentLanguage(locale: Locale): void {
  if (typeof document === "undefined") return;
  document.documentElement.lang = locale === "pt-BR" ? "pt-BR" : locale === "es" ? "es" : "en";
}

/**
 * Normaliza códigos vindos do backend para os locais suportados no app.
 * Exemplos:
 * - pt / pt-BR / pt_BR -> pt-BR
 * - en / en-US / en_GB -> en
 * - es / es-ES / es_MX -> es
 */
function normalizeBackendLanguage(language?: string | null): Locale | null {
  if (!language) return null;
  const value = language.trim().toLowerCase().replace("_", "-");
  if (!value) return null;
  if (value === "pt" || value.startsWith("pt-")) return "pt-BR";
  if (value === "en" || value.startsWith("en-")) return "en";
  if (value === "es" || value.startsWith("es-")) return "es";
  if (value === "pt-br") return "pt-BR";
  return "pt-BR";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuthOptional();
  const [locale, setLocaleState] = React.useState<Locale>("pt-BR");

  React.useEffect(() => {
    const next = normalizeBackendLanguage(auth?.preferences?.language) ?? "pt-BR";
    setLocaleState(next);
    applyDocumentLanguage(next);
  }, [auth?.preferences?.language]);

  const setLocale = React.useCallback((next: Locale) => {
    setLocaleState(next);
    applyDocumentLanguage(next);
  }, []);

  const dict = React.useMemo(() => getDictionary(locale), [locale]);
  const t = React.useCallback((key: TranslationKey) => dict[key] ?? key, [dict]);
  const value = React.useMemo<I18nContextValue>(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const context = React.useContext(I18nContext);
  if (!context) throw new Error("useTranslation must be used within I18nProvider");
  return context;
}

export function useLocale() {
  const { locale, setLocale } = useTranslation();
  return { locale, setLocale };
}
