import { z } from "zod";

/** Alinhado a `CategoryRequest` / `CategoryUpdateRequest` na API (nome mín. 3). */
export const categoryFormSchema = z.object({
  name: z
    .string()
    .min(3, "O nome deve ter pelo menos 3 caracteres.")
    .max(255, "O nome pode ter no máximo 255 caracteres."),
  movementType: z.enum(["INCOME", "EXPENSE"]),
  active: z.boolean(),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
