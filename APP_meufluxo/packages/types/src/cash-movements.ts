import type { ID } from "./index";
import type { PageResponse } from "./pagination";

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

export type CashMovementApiAccount = {
  id: number;
  name: string;
  currentBalance?: number;
};

export type CashMovementApiCategory = {
  id: number;
  name: string;
};

export type CashMovementApiSubCategory = {
  id: number;
  name: string;
  category?: CashMovementApiCategory | null;
};

export type CashMovementApiSourceType =
  | "MANUAL"
  | "PAYABLE"
  | "RECEIVABLE"
  | "CARD"
  | "TRANSFER";

export type CashMovementApiItem = {
  id: number;
  description: string;
  paymentMethod:
    | "PIX"
    | "DEBIT"
    | "CASH"
    | "TRANSFER"
    | "BOLETO"
    | "VA"
    | "INVOICE_CREDIT_CARD";
  amount: number;
  occurredAt: string;
  referenceMonth?: string;
  movementType: "INCOME" | "EXPENSE";
  account: CashMovementApiAccount;
  subCategory: CashMovementApiSubCategory;
  sourceType?: CashMovementApiSourceType;
  sourceId?: string | number | null;
};

export type CashMovementApiPageResponse = PageResponse<CashMovementApiItem>;

