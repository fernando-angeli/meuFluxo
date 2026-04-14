import { z } from "zod";

export const creditCardExpenseFormSchema = z
  .object({
    creditCardId: z.number().nullable(),
    description: z
      .string()
      .trim()
      .min(3, "Descrição deve ter ao menos 3 caracteres.")
      .max(100, "Descrição deve ter no máximo 100 caracteres."),
    purchaseDate: z.string().min(10, "Data da compra é obrigatória."),
    categoryId: z.number().nullable(),
    subcategoryId: z.number().nullable(),
    totalAmount: z.string().min(1, "Informe o valor da compra."),
    entryType: z.enum(["SINGLE", "INSTALLMENT"]),
    installmentCount: z.number().min(2, "Mínimo de 2 parcelas.").max(99, "Máximo de 99 parcelas."),
    notes: z.string().max(250, "Observação deve ter no máximo 250 caracteres.").optional(),
  })
  .superRefine((values, ctx) => {
    if (!Number.isFinite(values.creditCardId) || (values.creditCardId ?? 0) <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["creditCardId"],
        message: "Selecione o cartão.",
      });
    }

    if (!Number.isFinite(values.categoryId) || (values.categoryId ?? 0) <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["categoryId"],
        message: "Selecione a categoria.",
      });
    }

    if (values.entryType === "SINGLE") return;
    if (!Number.isFinite(values.installmentCount) || values.installmentCount < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["installmentCount"],
        message: "Informe a quantidade de parcelas para lançamento parcelado.",
      });
    }
  });

export type CreditCardExpenseFormValues = z.infer<typeof creditCardExpenseFormSchema>;
