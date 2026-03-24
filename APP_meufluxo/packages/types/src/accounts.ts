import type { EntityMeta } from "./categories";

export type AccountType =
  | "CHECKING"
  | "CREDIT_CARD"
  | "CASH"
  | "INVESTMENT"
  | "SAVING"
  | "BENEFIT_CARD";

export type AccountId = string;

export type Account = {
  id: AccountId;
  name: string;
  accountType: AccountType;
  currentBalance: number;
  balanceUpdatedAt: string | null;
  meta: EntityMeta;
};

export type AccountDetailsMeta = EntityMeta & {
  createdByUserId: number | null;
  createdByUserName: string | null;
  updatedByUserId: number | null;
  updatedByUserName: string | null;
};

export type AccountDetails = Omit<Account, "meta"> & {
  initialBalance: number;
  meta: AccountDetailsMeta;
  /** Campos futuros opcionais, quando o backend expor. */
  movementCount?: number | null;
  nextScheduledMovementsCount?: number | null;
};
