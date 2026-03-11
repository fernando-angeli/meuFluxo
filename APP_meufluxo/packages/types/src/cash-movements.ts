import type { ID } from "./index";

export type PaymentMethod = "PIX" | "CREDIT_CARD" | "DEBIT_CARD" | "CASH" | "TRANSFER" | "OTHER";

export type CashMovementType = "INCOME" | "EXPENSE" | "TRANSFER" | "ADJUSTMENT";

export type CashMovement = {
  id: ID;
  workspaceId: ID;
  type: CashMovementType;
  amount: number;
  currency: "BRL" | "USD" | "EUR";
  occurredAt: string; // ISO date
  description?: string;
  paymentMethod?: PaymentMethod;
  categoryId?: ID;
  accountId?: ID;
  counterpartyAccountId?: ID; // transferências
  referenceMonth?: string; // YYYY-MM (útil p/ relatórios)
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

