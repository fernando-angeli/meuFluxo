import type { ID } from "./index";

export type InvoiceStatus =
  | "OPEN"
  | "CLOSED"
  | "PAID"
  | "PARTIALLY_PAID"
  | "OVERDUE";

export type CreditCardInvoiceListItem = {
  id: ID;
  creditCardId: ID;
  creditCardName: string;
  cardDisplayName?: string | null;
  referenceLabel: string;
  periodStart?: string | null;
  periodEnd?: string | null;
  closingDate?: string | null;
  dueDate: string; // ISO date
  purchasesAmount: number;
  previousBalance: number;
  interestAmount?: number;
  lateFeeAmount?: number;
  otherFeesAmount?: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: InvoiceStatus;
  statusLabel?: string | null;
  canClose?: boolean;
  canPay?: boolean;
  canEditCharges?: boolean;
  canEditExpenses?: boolean;
  canReopen?: boolean;
};

export type InvoiceExpenseItem = {
  id: ID;
  description: string;
  categoryName: string;
  subCategoryName: string | null;
  purchaseDate: string;
  installmentLabel: string | null;
  amount: number;
  status: InvoiceStatus | "OPEN" | "INVOICED" | "PAID" | "CANCELED";
};

export type InvoicePaymentItem = {
  id: ID;
  paymentDate: string;
  accountId: ID | null;
  accountName: string;
  amount: number;
  notes: string | null;
  movementId: ID | null;
};

export type InvoiceDetails = Invoice & {
  payments: InvoicePaymentItem[];
  expenses: InvoiceExpenseItem[];
};

export type InvoicePaymentCreateRequest = {
  accountId: number;
  paymentDate: string;
  amount: number;
  notes?: string | null;
};

export type InvoiceChargesUpdateRequest = {
  interestAmount: number;
  lateFeeAmount: number;
  otherFeesAmount: number;
};

export type CreditCardInvoiceDetailsExpenseItem = {
  id: ID;
  description: string;
  purchaseDate: string;
  categoryId: ID | null;
  categoryName: string | null;
  subcategoryId: ID | null;
  subcategoryName: string | null;
  amount: number;
  installmentNumber: number | null;
  installmentCount: number | null;
  installmentGroupId: string | null;
  status: string;
  statusLabel: string | null;
};

export type CreditCardInvoiceDetailsPaymentItem = {
  id: ID;
  accountId: ID | null;
  accountName: string | null;
  paymentDate: string;
  amount: number;
  notes: string | null;
};

export type CreditCardInvoiceDetails = {
  id: ID;
  creditCardId: ID;
  creditCardName: string;
  cardDisplayName: string | null;
  creditCardBrand: "VISA" | "MASTERCARD" | null;
  closingDay: number | null;
  dueDay: number | null;
  referenceYear: number | null;
  referenceMonth: number | null;
  referenceLabel: string;
  periodStart: string | null;
  periodEnd: string | null;
  closingDate: string | null;
  dueDate: string | null;
  purchasesAmount: number;
  previousBalance: number;
  revolvingInterest: number;
  lateFee: number;
  otherCharges: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  currentBalance: number;
  status: InvoiceStatus;
  statusLabel: string | null;
  canClose: boolean;
  canPay: boolean;
  canEditCharges: boolean;
  canEditExpenses: boolean;
  expenses: CreditCardInvoiceDetailsExpenseItem[];
  payments: CreditCardInvoiceDetailsPaymentItem[];
};

export type CreditCardInvoicePayment = {
  id: ID;
  invoiceId: ID;
  invoiceReference: string | null;
  accountId: ID | null;
  accountName: string | null;
  paymentDate: string;
  amount: number;
  notes: string | null;
  movementId: ID | null;
  active: boolean;
  createdAt: string | null;
  updatedAt: string | null;
};

// Compatibilidade com código legado.
export type Invoice = CreditCardInvoiceListItem;

