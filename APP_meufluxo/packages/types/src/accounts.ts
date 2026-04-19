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
  /** Conta corrente (CHECKING): dados bancários e limite, quando a API expuser. */
  bankCode?: string | null;
  bankName?: string | null;
  agency?: string | null;
  accountNumber?: string | null;
  /** Status textual da conta quando a API expuser (ex.: ACTIVE). */
  status?: string | null;
  overdraftLimit?: number | null;
  overdraftUsed?: number | null;
  /** Saldo disponível / limite livre (legado ou API). */
  availableBalance?: number | null;
  /** Disponível no cheque especial quando a API calcular separado de `availableBalance`. */
  overdraftAvailable?: number | null;
  /** Percentual de uso do limite (0–100), quando a API expuser. */
  overdraftUsagePercent?: number | null;
  isUsingOverdraft?: boolean | null;
  isLimitExceeded?: boolean | null;
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
