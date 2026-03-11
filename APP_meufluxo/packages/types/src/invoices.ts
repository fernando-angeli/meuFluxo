import type { ID } from "./index";

export type InvoiceStatus = "OPEN" | "CLOSED" | "PAID" | "OVERDUE";

export type Invoice = {
  id: ID;
  workspaceId: ID;
  creditCardId: ID;
  referenceMonth: string; // YYYY-MM
  total: number;
  currency: "BRL" | "USD" | "EUR";
  status: InvoiceStatus;
  closedAt?: string; // ISO
  dueAt: string; // ISO date
  paidAt?: string; // ISO date
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

