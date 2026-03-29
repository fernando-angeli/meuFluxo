import { format, isValid, parse, parseISO } from "date-fns";

const DISPLAY_PATTERN = "dd/MM/yyyy";
const ISO_PATTERN = "yyyy-MM-dd";

/**
 * Aceita `yyyy-MM-dd` ou `dd/MM/yyyy` e retorna `yyyy-MM-dd` válido, ou null.
 */
export function normalizeExpenseDateInput(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const parsed = parseISO(s);
    return isValid(parsed) ? s : null;
  }

  const parsed = parse(s, DISPLAY_PATTERN, new Date());
  if (!isValid(parsed)) return null;
  return format(parsed, ISO_PATTERN);
}

export function formatIsoDateToDisplay(iso: string): string {
  const s = iso.trim();
  if (!s) return "";
  const parsed = parseISO(s);
  if (!isValid(parsed)) return s;
  return format(parsed, DISPLAY_PATTERN);
}
