export function getDefaultDashboardDateRange(): { startDate: string; endDate: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const endDate = end > now ? now : end;
  return {
    startDate: formatDate(start),
    endDate: formatDate(endDate),
  };
}

export function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Retorna o primeiro e último dia do mês no ano dado.
 * monthIndex: 0 = Janeiro, 11 = Dezembro.
 * Considera ano bissexto para Fevereiro.
 */
export function getMonthRange(
  year: number,
  monthIndex: number,
): { startDate: string; endDate: string } {
  const start = new Date(year, monthIndex, 1);
  const end = new Date(year, monthIndex + 1, 0);
  return {
    startDate: formatDate(start),
    endDate: formatDate(end),
  };
}

/**
 * Se o range (startDate, endDate) corresponder exatamente a um mês inteiro,
 * retorna o índice do mês (0-11). Caso contrário, retorna null.
 */
export function getMonthIndexFromRange(
  startDate: string,
  endDate: string,
): number | null {
  const start = parseISODate(startDate);
  const end = parseISODate(endDate);
  if (!start || !end) return null;
  const firstOfMonth = new Date(start.getFullYear(), start.getMonth(), 1);
  const lastOfMonth = new Date(
    start.getFullYear(),
    start.getMonth() + 1,
    0,
  );
  if (
    start.getTime() === firstOfMonth.getTime() &&
    end.getTime() === lastOfMonth.getTime() &&
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth()
  ) {
    return start.getMonth();
  }
  return null;
}

/**
 * Retorna o ano da data no formato ISO (yyyy-MM-dd).
 */
export function getYearFromDate(iso: string): number {
  const d = parseISODate(iso);
  return d ? d.getFullYear() : new Date().getFullYear();
}

function parseISODate(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const y = parseInt(match[1], 10);
  const m = parseInt(match[2], 10) - 1;
  const day = parseInt(match[3], 10);
  const d = new Date(y, m, day);
  if (d.getFullYear() !== y || d.getMonth() !== m || d.getDate() !== day) {
    return null;
  }
  return d;
}
