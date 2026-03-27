"use client";

import * as React from "react";
import type { UseFormReturn } from "react-hook-form";

import { Input } from "@/components/ui/input";
import type { TranslationKey } from "@/lib/i18n/types";
import type { ExpenseCreateFormValues } from "@/features/expenses/expense-create-form.schema";
import type { ExpenseRecurrenceType } from "@/features/expenses/recurrence-utils";
import { cn } from "@/lib/utils";

const inlineNumberInputClassName = cn(
  "h-8 min-h-8 w-[3rem] min-w-[2.5rem] shrink-0 px-1.5 text-center text-sm tabular-nums",
  "[-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
);

export function recurrencePreviewLine(
  form: UseFormReturn<ExpenseCreateFormValues>,
  recurrenceType: ExpenseRecurrenceType,
  t: (key: TranslationKey) => string,
): string | null {
  const repetitionsCount = Number(form.watch("repetitionsCount") ?? "");
  if (!Number.isFinite(repetitionsCount) || repetitionsCount < 1) return null;

  if (recurrenceType === "INTERVAL_DAYS") {
    const intervalDays = Number(form.watch("intervalDays") ?? "");
    if (!Number.isFinite(intervalDays) || intervalDays < 1) return null;
    return t("expenses.form.recurrence.previewEveryDays")
      .replace("{{count}}", String(repetitionsCount))
      .replace("{{days}}", String(intervalDays));
  }

  const dueDate = form.watch("dueDate");
  if (!dueDate) return null;
  const dayFromDue = Number(dueDate.split("-")[2]);
  if (!Number.isFinite(dayFromDue) || dayFromDue < 1) return null;
  return t("expenses.form.recurrence.previewFixedDay")
    .replace("{{count}}", String(repetitionsCount))
    .replace("{{day}}", String(dayFromDue));
}

export type ExpenseRecurrenceInlineSentenceProps = {
  form: UseFormReturn<ExpenseCreateFormValues>;
  t: (key: TranslationKey) => string;
  recurrenceType: ExpenseRecurrenceType;
  idPrefix: string;
  repetitionsInputClassName?: string;
  intervalInputClassName?: string;
  /** Mostrar resumo em texto menor (ex.: página de registro) */
  showPreview?: boolean;
  className?: string;
};

export function ExpenseRecurrenceInlineSentence({
  form,
  t,
  recurrenceType,
  idPrefix,
  repetitionsInputClassName,
  intervalInputClassName,
  showPreview = false,
  className,
}: ExpenseRecurrenceInlineSentenceProps) {
  const dueDate = form.watch("dueDate");
  const repetitionsClass = repetitionsInputClassName ?? inlineNumberInputClassName;
  const intervalClass = intervalInputClassName ?? inlineNumberInputClassName;

  const dayFromDue = React.useMemo(() => {
    if (!dueDate?.trim()) return null;
    const d = Number(dueDate.split("-")[2]);
    return Number.isFinite(d) && d >= 1 ? d : null;
  }, [dueDate]);

  const repetitionsErr = form.formState.errors.repetitionsCount?.message;
  const intervalErr = form.formState.errors.intervalDays?.message;
  const preview = showPreview ? recurrencePreviewLine(form, recurrenceType, t) : null;

  return (
    <div
      className={cn("min-w-0 space-y-1.5", className)}
      role="group"
      aria-label={t("expenses.form.recurrence.sentenceGroupAria")}
    >
      <p className="text-sm leading-relaxed text-foreground">
        <span className="inline-flex max-w-full flex-wrap items-center gap-x-1 gap-y-1.5">
          <span>{t("expenses.form.recurrence.sentenceRepeatPrefix")}</span>
          <Input
            id={`${idPrefix}-repetitions`}
            type="number"
            className={repetitionsClass}
            min={1}
            max={120}
            step={1}
            aria-label={t("expenses.form.recurrence.repetitions")}
            {...form.register("repetitionsCount")}
          />
          {recurrenceType === "INTERVAL_DAYS" ? (
            <>
              <span>{t("expenses.form.recurrence.sentenceIntervalMid")}</span>
              <Input
                id={`${idPrefix}-interval-days`}
                type="number"
                className={intervalClass}
                min={1}
                max={365}
                step={1}
                aria-label={t("expenses.form.recurrence.intervalDaysLabel")}
                {...form.register("intervalDays")}
              />
              <span>{t("expenses.form.recurrence.sentenceIntervalEnd")}</span>
            </>
          ) : (
            <>
              <span>{t("expenses.form.recurrence.sentenceEveryDayMid")}</span>
              {dayFromDue != null ? (
                <span className="font-semibold tabular-nums text-foreground">{dayFromDue}</span>
              ) : (
                <span className="text-muted-foreground">
                  {" \u2014 "}
                  <span className="font-normal">{t("expenses.form.recurrence.fixedDayPendingHint")}</span>
                </span>
              )}
            </>
          )}
        </span>
      </p>

      {repetitionsErr || intervalErr ? (
        <div className="flex flex-col gap-0.5 text-xs text-destructive">
          {repetitionsErr ? <p>{repetitionsErr}</p> : null}
          {intervalErr ? <p>{intervalErr}</p> : null}
        </div>
      ) : null}

      {preview ? <p className="text-xs text-muted-foreground">{preview}</p> : null}
    </div>
  );
}
