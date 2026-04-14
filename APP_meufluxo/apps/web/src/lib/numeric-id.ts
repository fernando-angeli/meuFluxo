export function toNumericId(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) return value;
  const raw = String(value ?? "").trim();
  if (!raw) return null;

  const parsed = Number(raw);
  if (Number.isFinite(parsed) && parsed > 0) return parsed;

  // Compatibilidade temporária para legados como "cc_1", "cat_12", etc.
  const suffix = raw.match(/(\d+)$/);
  if (!suffix) return null;
  const suffixParsed = Number(suffix[1]);
  return Number.isFinite(suffixParsed) && suffixParsed > 0 ? suffixParsed : null;
}

export function toNumericIdString(value: unknown): string | null {
  const id = toNumericId(value);
  return id == null ? null : String(id);
}
