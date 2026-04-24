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

/** Corpo enviado ao POST /credit-card-expenses (o backend não usa entryType). */
export type CreditCardExpenseCreateRequest = {
  creditCardId: number;
  description: string;
  purchaseDate: string;
  categoryId: number;
  subcategoryId?: number | null;
  totalAmount: number;
  installmentCount?: number | null;
  notes?: string | null;
};

/** Corpo enviado ao PUT /credit-card-expenses/:id (valor da parcela/linha, alinhado à API Java). */
export type CreditCardExpenseUpdateRequest = {
  description: string;
  purchaseDate: string;
  categoryId: number;
  subcategoryId?: number | null;
  amount: number;
  notes?: string | null;
};
