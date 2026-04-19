import { addMonths, endOfMonth, format, parseISO, startOfMonth } from "date-fns";

import type { DateRangeValue } from "@/components/filters";

function toIsoDate(d: Date) {
  return format(d, "yyyy-MM-dd");
}

/** Primeiro e último dia do mês civil de `d`. */
export function monthRangeForDate(d: Date): DateRangeValue {
  return {
    startDate: toIsoDate(startOfMonth(d)),
    endDate: toIsoDate(endOfMonth(d)),
  };
}

export function monthKeyFromDate(d: Date): string {
  return format(startOfMonth(d), "yyyy-MM");
}

/**
 * Botões de mês na visão da conta:
 * 4 meses anteriores ao corrente, mês corrente, depois meses futuros (apenas com lançamentos), máx. 12.
 */
export function buildAccountMonthQuickRanges(params: {
  today: Date;
  /** Chaves `yyyy-MM` de meses **estritamente posteriores** ao mês corrente que possuem lançamento. */
  futureMonthKeysWithMovements: ReadonlySet<string>;
}): DateRangeValue[] {
  const { today, futureMonthKeysWithMovements } = params;
  const cur = startOfMonth(today);
  const monthStarts: Date[] = [];

  for (let k = 4; k >= 1; k -= 1) {
    monthStarts.push(addMonths(cur, -k));
  }
  monthStarts.push(cur);

  const currentKey = format(cur, "yyyy-MM");
  const sortedFuture = Array.from(futureMonthKeysWithMovements)
    .filter((key) => key > currentKey)
    .sort();

  for (const key of sortedFuture) {
    if (monthStarts.length >= 12) break;
    const d = parseISO(`${key}-01`);
    if (Number.isNaN(d.getTime())) continue;
    monthStarts.push(startOfMonth(d));
  }

  return monthStarts.slice(0, 12).map((d) => monthRangeForDate(d));
}

export function rangesEqual(a: DateRangeValue, b: DateRangeValue) {
  return a.startDate === b.startDate && a.endDate === b.endDate;
}
