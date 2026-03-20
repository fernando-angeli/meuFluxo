import type { CreditCard } from "@meufluxo/types";

const now = new Date().toISOString();

export const mockCreditCards: CreditCard[] = [
  {
    id: "cc_1",
    name: "Nubank Platinum",
    lastFourDigits: "1234",
    creditLimit: 8000,
    closingDay: 5,
    dueDay: 15,
    annualFeeEnabled: false,
    annualFeeAmount: null,
    brandCard: "MASTERCARD",
    annualFeeWaiverThreshold: null,
    defaultPaymentAccountId: null,
    meta: { createdAt: now, updatedAt: now, active: true },
  },
];
