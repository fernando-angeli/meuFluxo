"use client";

import * as React from "react";
import { getDictionary } from "./index";
import type { Locale, TranslationKey } from "./types";

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
};

const I18nContext = React.createContext<I18nContextValue | null>(null);

const STORAGE_KEY = "meufluxo-locale";

function getInitialLocale(): Locale {
  if (typeof window === "undefined") return "pt-BR";
  const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
  if (stored && (stored === "pt-BR" || stored === "en" || stored === "es")) return stored;
  const lang = navigator.language;
  if (lang.startsWith("es")) return "es";
  if (lang.startsWith("en")) return "en";
  return "pt-BR";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>("pt-BR");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setLocaleState(getInitialLocale());
    setMounted(true);
  }, []);

  const setLocale = React.useCallback((next: Locale) => {
    setLocaleState(next);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, next);
      document.documentElement.lang = next === "pt-BR" ? "pt-BR" : next === "es" ? "es" : "en";
    }
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    document.documentElement.lang = locale === "pt-BR" ? "pt-BR" : locale === "es" ? "es" : "en";
  }, [mounted, locale]);

  const dict = React.useMemo(() => getDictionary(locale), [locale]);
  const t = React.useCallback(
    (key: TranslationKey) => dict[key] ?? key,
    [dict],
  );

  const value = React.useMemo<I18nContextValue>(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t],
  );

  if (!mounted) {
    const fallbackDict = getDictionary("pt-BR");
    const fallbackT = (key: TranslationKey) => fallbackDict[key] ?? key;
    const fallbackValue: I18nContextValue = {
      locale: "pt-BR",
      setLocale: () => {},
      t: fallbackT,
    };
    return (
      <I18nContext.Provider value={fallbackValue}>
        {children}
      </I18nContext.Provider>
    );
  }

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const ctx = React.useContext(I18nContext);
  if (!ctx) throw new Error("useTranslation must be used within I18nProvider");
  return ctx;
}

export function useLocale() {
  const { locale, setLocale } = useTranslation();
  return { locale, setLocale };
}
