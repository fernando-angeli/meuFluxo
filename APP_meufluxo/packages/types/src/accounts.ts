import type { ID } from "./index";

export type AccountType = "BANK" | "WALLET" | "CASH" | "INVESTMENT";

export type Account = {
  id: ID;
  workspaceId: ID;
  name: string;
  type: AccountType;
  institution?: string;
  balance: number; // usar centavos no futuro (Money). Por agora, mock simples.
  currency: "BRL" | "USD" | "EUR";
  isActive: boolean;
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

