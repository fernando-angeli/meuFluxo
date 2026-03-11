import type { Invoice } from "@meufluxo/types";
import { isoDate, isoMonth } from "@meufluxo/utils";

const now = new Date();

export const mockInvoices: Invoice[] = [
  {
    id: "inv_1",
    workspaceId: "ws_1",
    creditCardId: "cc_1",
    referenceMonth: isoMonth(now),
    total: 1249.32,
    currency: "BRL",
    status: "OPEN",
    dueAt: isoDate(new Date(now.getFullYear(), now.getMonth(), 15)),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

