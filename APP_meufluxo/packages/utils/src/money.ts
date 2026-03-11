export function formatCurrency(
  value: number,
  currency: "BRL" | "USD" | "EUR" = "BRL",
  locale = currency === "BRL" ? "pt-BR" : "en-US",
) {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(value);
}

export function sum(values: Array<number | null | undefined>) {
  return values.reduce<number>((acc, v) => acc + (v ?? 0), 0);
}

