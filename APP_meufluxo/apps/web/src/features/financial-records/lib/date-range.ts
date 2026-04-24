import { addMonths, endOfMonth, format, startOfMonth, subMonths } from "date-fns";

import type { DateRangeValue } from "@/components/filters";

/** Primeiro dia do mês anterior até o último dia do mês seguinte (ex.: 23/04 → 01/03 … 31/05). */
export function getDefaultPlannedEntriesDateRange(now = new Date()): DateRangeValue {
  const start = startOfMonth(subMonths(now, 1));
  const end = endOfMonth(addMonths(now, 1));
  return {
    startDate: format(start, "yyyy-MM-dd"),
    endDate: format(end, "yyyy-MM-dd"),
  };
}
