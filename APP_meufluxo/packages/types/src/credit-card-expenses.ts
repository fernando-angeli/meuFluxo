import type { ID } from "./index";

export type CreditCardExpenseStatus =
  | "OPEN"
  | "INVOICED"
  | "PAID"
  | "CANCELED";

export type CreditCardExpenseEntryType = "SINGLE" | "INSTALLMENT";

export type CreditCardExpense = {
  id: ID;
  creditCardId: ID;
  creditCardName: string;
  invoiceId: ID | null;
  invoiceReference: string | null;
  categoryId: ID;
  categoryName: string;
  subCategoryId: ID | null;
  subCategoryName: string | null;
  description: string;
  purchaseDate: string;
  installmentLabel: string | null;
  totalAmount: number;
  notes: string | null;
  entryType: CreditCardExpenseEntryType;
  installmentCount: number;
  status: CreditCardExpenseStatus;
};

export type CreditCardExpenseCreateRequest = {
  creditCardId: number;
  description: string;
  purchaseDate: string;
  categoryId: number;
  subcategoryId?: number | null;
  totalAmount: number;
  entryType: CreditCardExpenseEntryType;
  installmentCount?: number | null;
  notes?: string | null;
};

export type CreditCardExpenseUpdateRequest = {
  creditCardId: number;
  description: string;
  purchaseDate: string;
  categoryId: number;
  subcategoryId?: number | null;
  totalAmount: number;
  entryType: CreditCardExpenseEntryType;
  installmentCount?: number | null;
  notes?: string | null;
};
