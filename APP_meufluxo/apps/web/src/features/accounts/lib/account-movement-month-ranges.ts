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
 * Atalhos de mês na visão da conta:
 * - Com `minMonthKey` (mês da data de referência do saldo inicial): o primeiro botão é esse mês; em seguida,
 *   todos os meses civis consecutivos até o mês corrente.
 * - Sem `minMonthKey`: começa em (mês corrente − 6), até o mês corrente.
 * - Depois do mês corrente: até 6 meses à frente, somente meses que tenham lançamento (`futureMonthKeysWithMovements`).
 */
export function buildAccountMonthQuickRanges(params: {
  today: Date;
  /** Chaves `yyyy-MM` de meses **estritamente posteriores** ao mês corrente que possuem lançamento. */
  futureMonthKeysWithMovements: ReadonlySet<string>;
  /** Mês mínimo permitido (mês civil de `initialBalanceDate`). Formato `yyyy-MM`. */
  minMonthKey?: string;
}): DateRangeValue[] {
  const { today, futureMonthKeysWithMovements, minMonthKey } = params;
  const cur = startOfMonth(today);
  const winStartFallback = addMonths(cur, -6);
  const winEnd = addMonths(cur, 6);
  const winEndKey = monthKeyFromDate(winEnd);

  let leftNav: Date;
  if (minMonthKey) {
    const anchor = parseISO(`${minMonthKey}-01`);
    if (Number.isNaN(anchor.getTime())) {
      leftNav = winStartFallback;
    } else {
      leftNav = startOfMonth(anchor);
    }
  } else {
    leftNav = winStartFallback;
  }

  if (leftNav.getTime() > cur.getTime()) {
    leftNav = cur;
  }

  const monthStarts: Date[] = [];
  for (let d = leftNav; d.getTime() <= cur.getTime(); d = addMonths(d, 1)) {
    monthStarts.push(startOfMonth(d));
  }

  const currentKey = format(cur, "yyyy-MM");
  const sortedFuture = Array.from(futureMonthKeysWithMovements)
    .filter((key) => key > currentKey && key <= winEndKey)
    .sort();

  for (const key of sortedFuture) {
    const d = parseISO(`${key}-01`);
    if (Number.isNaN(d.getTime())) continue;
    monthStarts.push(startOfMonth(d));
  }

  return monthStarts.map((d) => monthRangeForDate(d));
}

export function rangesEqual(a: DateRangeValue, b: DateRangeValue) {
  return a.startDate === b.startDate && a.endDate === b.endDate;
}
