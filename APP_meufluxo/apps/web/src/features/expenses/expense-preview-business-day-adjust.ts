"use client";

import type { ExpenseBatchPreviewEntry, Holiday, PageResponse } from "@meufluxo/types";

import { api } from "@/services/api";

function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function fromIsoDate(value: string): Date {
  const [y, m, d] = value.split("-").map((n) => Number(n));
  return new Date(y, m - 1, d);
}

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

async function fetchActiveHolidayDates(): Promise<Set<string>> {
  const dates = new Set<string>();
  const size = 200;
  let page = 0;

  while (true) {
    const response = (await api.holidays.list({
      page,
      size,
      active: true,
      sort: "holidayDate,asc",
    })) as PageResponse<Holiday>;

    (response.content ?? []).forEach((holiday) => {
      if (holiday.holidayDate) {
        dates.add(String(holiday.holidayDate));
      }
    });

    if (response.last || page >= Math.max(0, (response.totalPages ?? 1) - 1)) {
      break;
    }
    page += 1;
  }

  return dates;
}

function adjustDateToBusinessDay(isoDate: string, holidayDates: Set<string>): {
  dueDate: string;
  adjustedAutomatically: boolean;
  originalDueDate: string | null;
} {
  let cursor = fromIsoDate(isoDate);
  const original = isoDate;

  while (isWeekend(cursor) || holidayDates.has(toIsoDate(cursor))) {
    cursor.setDate(cursor.getDate() + 1);
  }

  const adjusted = toIsoDate(cursor);
  const changed = adjusted !== original;

  return {
    dueDate: adjusted,
    adjustedAutomatically: changed,
    originalDueDate: changed ? original : null,
  };
}

export async function applyBusinessDayAdjustmentsToPreviewEntries(
  entries: ExpenseBatchPreviewEntry[],
): Promise<ExpenseBatchPreviewEntry[]> {
  if (!entries.length) return entries;

  try {
    const holidayDates = await fetchActiveHolidayDates();
    return entries.map((entry) => {
      const adjusted = adjustDateToBusinessDay(entry.dueDate, holidayDates);
      return {
        ...entry,
        dueDate: adjusted.dueDate,
        adjustedAutomatically: adjusted.adjustedAutomatically,
        originalDueDate: adjusted.originalDueDate,
      };
    });
  } catch {
    // Falha ao consultar feriados não deve bloquear o fluxo.
    return entries;
  }
}

