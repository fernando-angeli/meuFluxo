export function formatCurrency(
  value: number,
  currency: "BRL" | "USD" | "EUR" = "BRL",
  locale = currency === "BRL" ? "pt-BR" : "en-US",
) {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(value);
}

/** Normaliza código de moeda vindo de preferências (string). */
export function resolveWalletCurrency(pref?: string | null): "BRL" | "USD" | "EUR" {
  const c = (pref ?? "BRL").trim().toUpperCase();
  if (c === "USD" || c === "EUR" || c === "BRL") return c;
  return "BRL";
}

/**
 * Locale BCP 47 para Intl alinhado ao idioma da interface (pt-BR / en / es).
 */
export function intlLocaleFromAppLocale(appLocale: string): string {
  if (appLocale === "pt-BR") return "pt-BR";
  if (appLocale === "es") return "es-ES";
  return "en-US";
}

/**
 * Texto para edição antes de formatar com moeda ao sair do foco (decimal conforme o locale).
 */
export function amountToEditString(value: number, locale = "pt-BR"): string {
  if (!Number.isFinite(value)) return "0";
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    useGrouping: false,
  }).format(value);
}

/**
 * Interpreta texto digitado em campo de moeda (aceita vírgula ou ponto como decimal).
 */
export function parseMoneyInput(raw: string): number {
  const cleaned = raw.trim().replace(/[^\d.,-]/g, "");
  if (!cleaned) return 0;
  let normalized = cleaned;
  if (cleaned.includes(",") && cleaned.includes(".")) {
    normalized =
      cleaned.lastIndexOf(",") > cleaned.lastIndexOf(".")
        ? cleaned.replace(/\./g, "").replace(",", ".")
        : cleaned.replace(/,/g, "");
  } else if (cleaned.includes(",")) {
    normalized = cleaned.replace(",", ".");
  }
  const n = Number(normalized);
  if (!Number.isFinite(n)) return 0;
  return n < 0 ? 0 : n;
}

export function sum(values: Array<number | null | undefined>) {
  return values.reduce<number>((acc, v) => acc + (v ?? 0), 0);
}

