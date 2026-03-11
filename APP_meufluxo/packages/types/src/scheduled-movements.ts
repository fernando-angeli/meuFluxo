import type { ID } from "./index";

export type ScheduledMovementFrequency = "ONCE" | "WEEKLY" | "MONTHLY" | "YEARLY";
export type ScheduledMovementStatus = "SCHEDULED" | "DUE" | "PAID" | "CANCELLED";

export type ScheduledMovement = {
  id: ID;
  workspaceId: ID;
  title: string;
  amount: number;
  currency: "BRL" | "USD" | "EUR";
  dueAt: string; // ISO date
  frequency: ScheduledMovementFrequency;
  status: ScheduledMovementStatus;
  description?: string;
  categoryId?: ID;
  accountId?: ID; // pode ser undefined até a baixa (requisito do domínio)
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

