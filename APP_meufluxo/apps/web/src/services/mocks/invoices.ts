import type { Invoice, InvoiceDetails } from "@meufluxo/types";
import { isoDate, isoMonth } from "@meufluxo/utils";

const now = new Date();

export const mockInvoices: Invoice[] = [
  {
    id: "inv_1",
    creditCardId: "cc_1",
    creditCardName: "Cartao principal",
    creditCardBrand: "Visa",
    referenceLabel: isoMonth(now),
    dueDate: isoDate(new Date(now.getFullYear(), now.getMonth(), 15)),
    purchasesAmount: 1249.32,
    previousBalance: 180.45,
    totalAmount: 1429.77,
    paidAmount: 500,
    remainingAmount: 929.77,
    status: "OPEN",
    statusLabel: "Aberta",
    periodStart: isoDate(new Date(now.getFullYear(), now.getMonth(), 1)),
    periodEnd: isoDate(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
    closingDate: isoDate(new Date(now.getFullYear(), now.getMonth(), 5)),
    interestAmount: 0,
    lateFeeAmount: 0,
    otherFeesAmount: 0,
    canClose: true,
    canPay: true,
    canEditCharges: true,
    canEditExpenses: true,
  },
];

export const mockInvoiceDetailsById: Record<string, InvoiceDetails> = {
  inv_1: {
    ...mockInvoices[0],
    expenses: [
      {
        id: "inv_exp_1",
        description: "Supermercado",
        categoryName: "Alimentação",
        subCategoryName: "Compras",
        purchaseDate: isoDate(new Date(now.getFullYear(), now.getMonth(), 2)),
        installmentLabel: "1/3",
        amount: 349.9,
        status: "INVOICED",
      },
      {
        id: "inv_exp_2",
        description: "Assinatura streaming",
        categoryName: "Lazer",
        subCategoryName: "Streaming",
        purchaseDate: isoDate(new Date(now.getFullYear(), now.getMonth(), 8)),
        installmentLabel: null,
        amount: 59.9,
        status: "INVOICED",
      },
    ],
    payments: [
      {
        id: "inv_pay_1",
        paymentDate: isoDate(new Date(now.getFullYear(), now.getMonth(), 12)),
        accountId: "acc_1",
        accountName: "Conta corrente",
        amount: 500,
        notes: "Pagamento parcial",
        movementId: "mov_1",
      },
    ],
  },
};

