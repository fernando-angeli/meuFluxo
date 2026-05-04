import { z } from "zod";
import { parseMoneyInput } from "@meufluxo/utils";

import { normalizeExpenseDateInput } from "@/features/expenses/expense-date-parse";
import type { TranslationKey } from "@/lib/i18n/types";

export function createExpenseCreateFormSchema(t: (key: TranslationKey) => string) {
  const invalidDateMsg = t("expenses.validation.dateInvalid");

  return z
    .object({
      creationType: z.enum(["SINGLE", "RECURRING"]),
      recurrenceType: z.enum(["INTERVAL_DAYS", "FIXED_DATES"]).optional(),
      description: z
        .string()
        .trim()
        .min(1, "Descrição é obrigatória.")
        .max(80, "Descrição deve ter no máximo 80 caracteres."),
      categoryId: z.string().trim().min(1, "Categoria é obrigatória."),
      subCategoryId: z.string().trim().optional(),
      expectedAmount: z
        .string()
        .trim()
        .min(1, t("expenses.validation.amountRequired"))
        .refine((value) => {
          const n = parseMoneyInput(value);
          return Number.isFinite(n) && n > 0;
        }, t("expenses.validation.amountPositive")),
      amountBehavior: z.enum(["FIXED", "ESTIMATED"]),
      issueDate: z
        .string()
        .trim()
        .refine((value) => value === "" || normalizeExpenseDateInput(value) != null, {
          message: invalidDateMsg,
        })
        .transform((value) => (value === "" ? "" : (normalizeExpenseDateInput(value) as string))),
      dueDate: z
        .string()
        .trim()
        .min(1, "Data do vencimento é obrigatória.")
        .refine((value) => normalizeExpenseDateInput(value) != null, {
          message: invalidDateMsg,
        })
        .transform((value) => normalizeExpenseDateInput(value) as string),
      document: z.string().trim().max(80, t("expenses.validation.documentMaxLength")),
      defaultAccountId: z.string().trim().optional(),
      notes: z
        .string()
        .max(250, "Observações devem ter no máximo 250 caracteres.")
        .optional(),
      repetitionsCount: z.string().trim().optional(),
      intervalDays: z.string().trim().optional(),
      settleImmediately: z.boolean().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.settleImmediately) {
        if (data.creationType !== "SINGLE") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["settleImmediately"],
            message: t("expenses.validation.settleOnlySingle"),
          });
        }
        if (!data.defaultAccountId?.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["settleImmediately"],
            message: t("expenses.validation.settleRequiresAccount"),
          });
        }
        if (!data.subCategoryId?.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["subCategoryId"],
            message: t("expenses.validation.settleRequiresSubCategory"),
          });
        }
      }

      if (data.creationType === "RECURRING") {
        const recurrenceType = data.recurrenceType;
        if (!recurrenceType) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["recurrenceType"],
            message: "Tipo de recorrência é obrigatório para projeções recorrentes.",
          });
          return;
        }

        const repetitions = Number(data.repetitionsCount ?? "");
        if (!data.repetitionsCount) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["repetitionsCount"],
            message: "Quantidade de repetições é obrigatória para projeção recorrente.",
          });
        } else if (!Number.isInteger(repetitions) || repetitions < 1) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["repetitionsCount"],
            message: "Quantidade de repetições deve ser maior ou igual a 1.",
          });
        } else if (repetitions > 120) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["repetitionsCount"],
            message: "Quantidade de repetições deve ser no máximo 120.",
          });
          return;
        }

        if (recurrenceType === "INTERVAL_DAYS") {
          const intervalDays = Number(data.intervalDays ?? "");
          if (!data.intervalDays) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["intervalDays"],
              message: "Intervalo em dias é obrigatório para este tipo de recorrência.",
            });
          } else if (!Number.isInteger(intervalDays) || intervalDays < 1) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["intervalDays"],
              message: "Intervalo em dias deve ser maior ou igual a 1.",
            });
          } else if (intervalDays > 365) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["intervalDays"],
              message: "Intervalo em dias deve ser no máximo 365.",
            });
          }
        }
      }
    });
}

export type ExpenseCreateFormValues = z.infer<ReturnType<typeof createExpenseCreateFormSchema>>;
