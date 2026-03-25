import { z } from "zod";

/** Alinhado a `SubCategoryRequest` / `SubCategoryUpdateRequest` (nome mín. 3). */
export const subcategoryFormSchema = z.object({
  name: z
    .string()
    .min(3, "O nome deve ter pelo menos 3 caracteres.")
    .max(255, "O nome pode ter no máximo 255 caracteres."),
  active: z.boolean(),
});

export type SubcategoryFormValues = z.infer<typeof subcategoryFormSchema>;
