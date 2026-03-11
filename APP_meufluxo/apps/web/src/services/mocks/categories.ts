import type { Category } from "@meufluxo/types";

export const mockCategories: Category[] = [
  {
    id: "cat_1",
    workspaceId: "ws_1",
    name: "Salário",
    type: "INCOME",
    color: "#22c55e",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "cat_2",
    workspaceId: "ws_1",
    name: "Alimentação",
    type: "EXPENSE",
    color: "#f97316",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "cat_3",
    workspaceId: "ws_1",
    name: "Mercado",
    type: "EXPENSE",
    parentId: "cat_2",
    color: "#fb923c",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "cat_4",
    workspaceId: "ws_1",
    name: "Ajustes",
    type: "ADJUSTMENT",
    color: "#a3a3a3",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

