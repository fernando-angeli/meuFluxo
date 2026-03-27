"use client";

import * as React from "react";
import type { UseFormReturn } from "react-hook-form";

import { ChoiceRadioGroup } from "@/components/ui/choice-radio-group";
import { Label } from "@/components/ui/label";
import type { TranslationKey } from "@/lib/i18n/types";
import type { ExpenseCreateFormValues } from "@/features/expenses/expense-create-form.schema";
import type { ExpenseRecurrenceType } from "@/features/expenses/recurrence-utils";
import { ExpenseRecurrenceInlineSentence } from "@/features/expenses/components/expense-recurrence-inline-sentence";

export type ExpenseRecurrenceSectionProps = {
  form: UseFormReturn<ExpenseCreateFormValues>;
  t: (key: TranslationKey) => string;
  recurrenceType: ExpenseRecurrenceType;
  /** Prefix for input ids, e.g. "expense-modal" or "expense" */
  idPrefix: string;
  repetitionsInputClassName?: string;
  intervalInputClassName?: string;
  /** Slightly looser spacing (page) vs compact (modal) */
  density?: "default" | "comfortable";
};

export function ExpenseRecurrenceSection({
  form,
  t,
  recurrenceType,
  idPrefix,
  repetitionsInputClassName,
  intervalInputClassName,
  density = "default",
}: ExpenseRecurrenceSectionProps) {
  const blockGap = density === "comfortable" ? "space-y-4" : "space-y-3";

  return (
    <section
      className="space-y-3"
      aria-label={t("expenses.form.recurrence.sectionTitle")}
    >
      <div className={blockGap}>
        <div>
          <Label className="text-sm font-medium text-foreground">
            {t("expenses.form.recurrence.recurrenceType")}
          </Label>
        </div>
        <div className="grid gap-3 md:grid-cols-[40fr_60fr] md:items-start">
          <div className="min-w-0 space-y-1.5">
            <ChoiceRadioGroup
              value={recurrenceType}
              aria-label={t("expenses.form.recurrence.recurrenceType")}
              onChange={(next) =>
                form.setValue("recurrenceType", next as ExpenseRecurrenceType, { shouldDirty: true })
              }
              options={
                [
                  {
                    value: "FIXED_DATES",
                    title: t("expenses.form.recurrence.fixedDateTitle"),
                    description: t("expenses.form.recurrence.fixedDateDescription"),
                  },
                  {
                    value: "INTERVAL_DAYS",
                    title: t("expenses.form.recurrence.intervalDaysTitle"),
                    description: t("expenses.form.recurrence.intervalDaysDescription"),
                  },
                ] as const
              }
            />
          </div>

          <ExpenseRecurrenceInlineSentence
            form={form}
            t={t}
            recurrenceType={recurrenceType}
            idPrefix={idPrefix}
            repetitionsInputClassName={repetitionsInputClassName}
            intervalInputClassName={intervalInputClassName}
            showPreview
          />
        </div>
      </div>
    </section>
  );
}
