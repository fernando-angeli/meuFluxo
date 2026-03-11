import type { ID } from "./index";

export type CreditCard = {
  id: ID;
  workspaceId: ID;
  name: string;
  brand?: "VISA" | "MASTERCARD" | "ELO" | "AMEX" | "OTHER";
  last4?: string;
  statementDay: number; // 1-31
  dueDay: number; // 1-31
  limit?: number;
  currency: "BRL" | "USD" | "EUR";
  isActive: boolean;
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

