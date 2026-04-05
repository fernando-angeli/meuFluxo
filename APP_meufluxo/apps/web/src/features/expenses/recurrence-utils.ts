import type { ExpenseBatchPreviewEntry } from "@meufluxo/types";

export type ExpenseRecurrenceType = "INTERVAL_DAYS" | "FIXED_DATES";

function parseISODate(value: string): Date {
  const [y, m, d] = value.split("-").map((part) => Number(part));
  return new Date(y, m - 1, d);
}

function toISODate(value: Date): string {
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, "0");
  const d = String(value.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function getLastDayOfMonth(year: number, monthIndex0: number): number {
  return new Date(year, monthIndex0 + 1, 0).getDate();
}

export function generateRecurringPreviewEntries(args: {
  recurrenceType: ExpenseRecurrenceType;
  issueDate?: string; // yyyy-MM-dd
  firstDueDate: string; // yyyy-MM-dd
  repetitionsCount: number;
  intervalDays?: number;
  expectedAmount: number;
}): ExpenseBatchPreviewEntry[] {
  const { recurrenceType, firstDueDate, repetitionsCount, expectedAmount } = args;
  const issueDate = args.issueDate?.trim() ? args.issueDate : firstDueDate;

  if (repetitionsCount < 1) return [];

  const start = parseISODate(firstDueDate);

  const entries: ExpenseBatchPreviewEntry[] = [];

  if (recurrenceType === "INTERVAL_DAYS") {
    const intervalDays = args.intervalDays ?? 0;
    if (intervalDays < 1) return [];

    for (let i = 0; i < repetitionsCount; i++) {
      entries.push({
        order: i + 1,
        issueDate,
        dueDate: toISODate(addDays(start, i * intervalDays)),
        expectedAmount,
        adjustedAutomatically: false,
        originalDueDate: null,
      });
    }
    return entries;
  }

  // Data fixa: dia do mês vem do "Primeiro vencimento" selecionado.
  const fixedDayOfMonth = start.getDate();

  // First occurrence is the first date matching `fixedDayOfMonth` on or after `firstDueDate`.
  const baseYear = start.getFullYear();
  const baseMonth = start.getMonth(); // 0-based

  const startDay = start.getDate();
  const firstMonthToUse = startDay <= fixedDayOfMonth ? baseMonth : baseMonth + 1;

  for (let i = 0; i < repetitionsCount; i++) {
    const monthIndex = firstMonthToUse + i;
    const year = baseYear + Math.floor(monthIndex / 12);
    const month0 = ((monthIndex % 12) + 12) % 12;
    const lastDay = getLastDayOfMonth(year, month0);
    const day = Math.min(fixedDayOfMonth, lastDay);

    const due = new Date(year, month0, day);
    entries.push({
      order: i + 1,
      issueDate,
      dueDate: toISODate(due),
      expectedAmount,
      adjustedAutomatically: false,
      originalDueDate: null,
    });
  }

  return entries;
}

