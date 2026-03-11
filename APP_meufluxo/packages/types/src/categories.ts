import type { ID } from "./index";

export type CategoryType = "INCOME" | "EXPENSE" | "TRANSFER" | "ADJUSTMENT";

export type Category = {
  id: ID;
  workspaceId: ID;
  name: string;
  type: CategoryType;
  color?: string; // hex
  icon?: string; // nome do ícone (ex.: lucide)
  parentId?: ID; // subcategoria
  isActive: boolean;
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

