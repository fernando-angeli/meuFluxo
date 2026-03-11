import type { Account } from "@meufluxo/types";

export const mockAccounts: Account[] = [
  {
    id: "acc_1",
    workspaceId: "ws_1",
    name: "Nubank",
    type: "BANK",
    institution: "Nubank",
    balance: 3250.45,
    currency: "BRL",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "acc_2",
    workspaceId: "ws_1",
    name: "Carteira",
    type: "WALLET",
    balance: 180.0,
    currency: "BRL",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "acc_3",
    workspaceId: "ws_1",
    name: "Investimentos",
    type: "INVESTMENT",
    balance: 14500.0,
    currency: "BRL",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

