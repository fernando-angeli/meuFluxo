import type { ScheduledMovement } from "@meufluxo/types";
import { isoDate } from "@meufluxo/utils";

const now = new Date();

export const mockScheduledMovements: ScheduledMovement[] = [
  {
    id: "sch_1",
    workspaceId: "ws_1",
    title: "Aluguel",
    amount: 1750,
    currency: "BRL",
    dueAt: isoDate(new Date(now.getFullYear(), now.getMonth(), 12)),
    frequency: "MONTHLY",
    status: "DUE",
    categoryId: "cat_2",
    accountId: undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "sch_2",
    workspaceId: "ws_1",
    title: "Internet",
    amount: 129.9,
    currency: "BRL",
    dueAt: isoDate(new Date(now.getFullYear(), now.getMonth(), 15)),
    frequency: "MONTHLY",
    status: "SCHEDULED",
    categoryId: "cat_2",
    accountId: "acc_1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

