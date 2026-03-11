import type { CreditCard } from "@meufluxo/types";

export const mockCreditCards: CreditCard[] = [
  {
    id: "cc_1",
    workspaceId: "ws_1",
    name: "Nubank Platinum",
    brand: "MASTERCARD",
    last4: "1234",
    statementDay: 5,
    dueDay: 15,
    limit: 8000,
    currency: "BRL",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

