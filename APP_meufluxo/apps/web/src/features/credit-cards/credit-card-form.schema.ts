import { z } from "zod";

import { parseMoneyInput } from "@meufluxo/utils";
import { CARD_BRANDS } from "@/constants/card-brands";

export const creditCardFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "O nome deve conter ao menos 3 caracteres.")
    .max(120, "O nome deve ter no máximo 120 caracteres."),
  brand: z.enum([CARD_BRANDS[0], ...CARD_BRANDS.slice(1)], {
    error: "A bandeira do cartão é obrigatória.",
  }),
  closingDay: z
    .number()
    .int("Use um número inteiro para o dia de fechamento.")
    .min(1, "O dia de fechamento deve ser entre 1 e 31.")
    .max(31, "O dia de fechamento deve ser entre 1 e 31."),
  dueDay: z
    .number()
    .int("Use um número inteiro para o dia de vencimento.")
    .min(1, "O dia de vencimento deve ser entre 1 e 31.")
    .max(31, "O dia de vencimento deve ser entre 1 e 31."),
  creditLimit: z
    .string()
    .trim()
    .refine((value) => value === "" || Number.isFinite(parseMoneyInput(value)), {
      message: "Informe um limite válido.",
    }),
  defaultPaymentAccountId: z.string(),
  notes: z.string().max(1000, "As observações devem ter no máximo 1000 caracteres."),
  active: z.boolean(),
});

export type CreditCardFormValues = z.infer<typeof creditCardFormSchema>;
