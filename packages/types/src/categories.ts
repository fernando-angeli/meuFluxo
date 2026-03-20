export type MovementType = "INCOME" | "EXPENSE";

export type EntityMeta = {
  createdAt: string;
  updatedAt: string;
  active: boolean;
};

export type CategorySummary = {
  id: string;
  name: string;
  movementType: MovementType;
};

export type Category = {
  id: string;
  name: string;
  movementType: MovementType;
  meta: EntityMeta;
};

export type SubCategory = {
  id: string;
  name: string;
  movementType: MovementType;
  category: CategorySummary;
  meta: EntityMeta;
};
