import type { Category, SubCategory } from "@meufluxo/types";

const now = new Date().toISOString();

export const mockCategories: Category[] = [
  {
    id: "cat_1",
    name: "Salário",
    movementType: "INCOME",
    meta: { createdAt: now, updatedAt: now, active: true },
  },
  {
    id: "cat_2",
    name: "Alimentação",
    movementType: "EXPENSE",
    meta: { createdAt: now, updatedAt: now, active: true },
  },
  {
    id: "cat_3",
    name: "Ajustes",
    movementType: "EXPENSE",
    meta: { createdAt: now, updatedAt: now, active: true },
  },
];

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
