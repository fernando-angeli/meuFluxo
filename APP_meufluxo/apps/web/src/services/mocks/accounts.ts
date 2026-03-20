import type { Account } from "@meufluxo/types";

const now = new Date().toISOString();

export const mockAccounts: Account[] = [
  {
    id: "acc_1",
    name: "Nubank",
    accountType: "CHECKING",
    currentBalance: 3250.45,
    balanceUpdatedAt: now,
    meta: { createdAt: now, updatedAt: now, active: true },
  },
  {
    id: "acc_2",
    name: "Carteira",
    accountType: "CASH",
    currentBalance: 180,
    balanceUpdatedAt: now,
    meta: { createdAt: now, updatedAt: now, active: true },
  },
  {
    id: "acc_3",
    name: "Investimentos",
    accountType: "INVESTMENT",
    currentBalance: 14500,
    balanceUpdatedAt: now,
    meta: { createdAt: now, updatedAt: now, active: true },
  },
];
