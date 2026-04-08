import { z } from "zod";

import { parseMoneyInput } from "@meufluxo/utils";

export const creditCardExpenseFormSchema = z
  .object({
    creditCardId: z.string().min(1, "O cartão é obrigatório."),
    description: z
      .string()
      .trim()
      .min(3, "A descrição deve conter ao menos 3 caracteres.")
      .max(255, "A descrição deve conter no máximo 255 caracteres."),
    purchaseDate: z.string().min(1, "A data da compra é obrigatória."),
    categoryId: z.string().min(1, "A categoria é obrigatória."),
    subcategoryId: z.string().min(1, "A subcategoria é obrigatória."),
    amount: z
      .string()
      .trim()
      .min(1, "O valor é obrigatório.")
      .refine(
        (value) => Number.isFinite(parseMoneyInput(value)) && parseMoneyInput(value) > 0,
        {
          message: "Informe um valor válido.",
        },
      ),
    entryType: z.enum(["SINGLE", "INSTALLMENT"]),
    installmentCount: z.number().int().min(1).max(120),
    notes: z
      .string()
      .max(1000, "As observações devem ter no máximo 1000 caracteres."),
  })
  .superRefine((values, ctx) => {
    if (values.entryType === "INSTALLMENT" && values.installmentCount < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["installmentCount"],
        message: "Para parcelado, informe no mínimo 2 parcelas.",
      });
    }
  });

export type CreditCardExpenseFormValues = z.infer<typeof creditCardExpenseFormSchema>;
