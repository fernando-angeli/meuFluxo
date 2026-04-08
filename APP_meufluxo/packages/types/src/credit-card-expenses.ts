import type { ID } from "./index";
import type { PageQueryParams } from "./pagination";

export type CreditCardExpenseStatus = "OPEN" | "CANCELED";

export type CreditCardExpense = {
  id: ID;
  creditCardId: ID;
  creditCardName: string;
  cardDisplayName: string | null;
  invoiceId: ID;
  invoiceReference: string | null;
  description: string;
  purchaseDate: string;
  categoryId: ID;
  categoryName: string;
  subcategoryId: ID;
  subcategoryName: string;
  amount: number;
  installmentNumber: number | null;
  installmentCount: number | null;
  installmentGroupId: string | null;
  status: CreditCardExpenseStatus;
  statusLabel: string | null;
  notes: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type CreditCardExpenseListParams = Partial<
  Omit<PageQueryParams, "page" | "size">
> & {
  page?: number;
  size?: number;
  sort?: string;
  creditCardId?: string;
  invoiceId?: string;
  categoryId?: number;
  subcategoryId?: number;
  installmentGroupId?: string;
  purchaseDateStart?: string;
  purchaseDateEnd?: string;
};

export type CreditCardExpenseCreateRequest = {
  creditCardId: number;
  description: string;
  purchaseDate: string;
  categoryId: number;
  subcategoryId: number;
  totalAmount: number;
  installmentCount?: number;
  notes?: string | null;
};

export type CreditCardExpenseUpdateRequest = {
  description: string;
  purchaseDate: string;
  categoryId: number;
  subcategoryId: number;
  amount: number;
  notes?: string | null;
};

export type CreditCardExpenseCreateResponse = {
  installmentGroupId: string | null;
  installmentCount: number;
  totalAmount: number;
  expenses: CreditCardExpense[];
};
