/** API pode enviar códigos numéricos; o formulário e a UI esperam string. */
export function normalizeBankString(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value.trim();
  return String(value).trim();
}
