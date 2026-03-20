import type { EntityMeta } from "./categories";

export type AccountType =
  | "CHECKING"
  | "CREDIT_CARD"
  | "CASH"
  | "INVESTMENT"
  | "SAVING"
  | "BENEFIT_CARD";

export type Account = {
  id: string;
  name: string;
  accountType: AccountType;
  currentBalance: number;
  balanceUpdatedAt: string;
  meta: EntityMeta;
};
