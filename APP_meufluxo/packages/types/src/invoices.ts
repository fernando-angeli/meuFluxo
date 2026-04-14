import type { ID } from "./index";

export type InvoiceStatus =
  | "OPEN"
  | "CLOSED"
  | "PAID"
  | "PARTIALLY_PAID"
  | "OVERDUE";

export type Invoice = {
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

