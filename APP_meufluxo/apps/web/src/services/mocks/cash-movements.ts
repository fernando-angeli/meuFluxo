import type { CashMovement } from "@meufluxo/types";
import { isoDate, isoMonth } from "@meufluxo/utils";

const now = new Date();

export const mockCashMovements: CashMovement[] = [
  {
    id: "mov_1",
    workspaceId: "ws_1",
    type: "INCOME",
    amount: 5200,
    currency: "BRL",
    occurredAt: isoDate(new Date(now.getFullYear(), now.getMonth(), 5)),
    description: "Salário",
    paymentMethod: "PIX",
    categoryId: "cat_1",
    accountId: "acc_1",
    referenceMonth: isoMonth(now),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "mov_2",
    workspaceId: "ws_1",
    type: "EXPENSE",
    amount: 245.9,
    currency: "BRL",
    occurredAt: isoDate(new Date(now.getFullYear(), now.getMonth(), 8)),
    description: "Mercado",
    paymentMethod: "DEBIT_CARD",
    categoryId: "cat_3",
    accountId: "acc_1",
    referenceMonth: isoMonth(now),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "mov_3",
    workspaceId: "ws_1",
    type: "EXPENSE",
    amount: 79.9,
    currency: "BRL",
    occurredAt: isoDate(new Date(now.getFullYear(), now.getMonth(), 10)),
    description: "Delivery",
    paymentMethod: "PIX",
    categoryId: "cat_2",
    accountId: "acc_1",
    referenceMonth: isoMonth(now),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

