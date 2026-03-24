import type { SubCategory } from "@meufluxo/types";

const now = new Date().toISOString();

/** Mantido para telas que ainda não integram subcategorias na API. */
export const mockSubCategories: SubCategory[] = [
  {
    id: "sub_1",
    name: "Mercado",
    movementType: "EXPENSE",
    category: {
      id: "cat_2",
      name: "Alimentação",
      movementType: "EXPENSE",
    },
    meta: { createdAt: now, updatedAt: now, active: true },
  },
];
