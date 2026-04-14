import type { CreditCardExpense } from "@meufluxo/types";
import { isoDate } from "@meufluxo/utils";

const now = new Date();

export const mockCreditCardExpenses: CreditCardExpense[] = [
  {
    id: "ce_1",
    creditCardId: "cc_1",
    creditCardName: "Nubank Platinum",
    invoiceId: "inv_1",
    invoiceReference: "2026-03",
    categoryId: "cat_1",
    categoryName: "Alimentação",
    subCategoryId: "sub_1",
    subCategoryName: "Supermercado",
    description: "Compra no mercado",
    purchaseDate: isoDate(new Date(now.getFullYear(), now.getMonth(), 10)),
    installmentLabel: "1/3",
    totalAmount: 349.9,
    notes: "Compra mensal",
    entryType: "INSTALLMENT",
    installmentCount: 3,
    status: "OPEN",
  },
];
