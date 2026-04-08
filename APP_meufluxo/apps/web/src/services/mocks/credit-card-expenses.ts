import type { CreditCardExpense } from "@meufluxo/types";
import { isoDate } from "@meufluxo/utils";

const now = new Date();

export const mockCreditCardExpenses: CreditCardExpense[] = [
  {
    id: "cc-exp-1",
    creditCardId: "cc_1",
    creditCardName: "Nubank Platinum",
    cardDisplayName: "Nubank Platinum - MASTERCARD",
    invoiceId: "inv_1",
    invoiceReference: `${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`,
    description: "Compra supermercado",
    purchaseDate: isoDate(new Date(now.getFullYear(), now.getMonth(), 2)),
    categoryId: "10",
    categoryName: "Alimentação",
    subcategoryId: "11",
    subcategoryName: "Supermercado",
    amount: 350.5,
    installmentNumber: 1,
    installmentCount: 1,
    installmentGroupId: null,
    status: "OPEN",
    statusLabel: "Aberta",
    notes: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
