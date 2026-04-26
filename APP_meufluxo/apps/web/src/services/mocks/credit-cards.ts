import type { CreditCard } from "@meufluxo/types";

const now = new Date().toISOString();

export const mockCreditCards: CreditCard[] = [
  {
    id: "cc_1",
    name: "Nubank Platinum",
    brand: "Mastercard",
    brandCard: "Mastercard",
    lastFourDigits: "1234",
    creditLimit: 8000,
    closingDay: 5,
    dueDay: 15,
    defaultPaymentAccountId: null,
    defaultPaymentAccountName: null,
    notes: null,
    meta: { createdAt: now, updatedAt: now, active: true },
  },
];
