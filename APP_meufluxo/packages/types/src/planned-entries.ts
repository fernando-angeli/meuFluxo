export type FinancialDirection = "INCOME" | "EXPENSE";

export type PlannedAmountBehavior = "FIXED" | "ESTIMATED";
export type PlannedEntryStatus = "OPEN" | "COMPLETED" | "CANCELED" | "OVERDUE";

/** Lista GET /expenses|/income: `OPEN`+`OVERDUE` cobre tudo que segue OPEN no BD (atraso é derivado na leitura). */
export const DASHBOARD_PROJECTION_PLANNED_STATUSES: readonly PlannedEntryStatus[] = ["OPEN", "OVERDUE"];

export type ExpenseCreateType = "SINGLE" | "RECURRING";

export type ExpenseCreateRequest = {
  description: string;
  categoryId: number;
  subCategoryId?: number | null;
  expectedAmount: number;
  amountBehavior: PlannedAmountBehavior;
  document?: string | null;
  issueDate: string;
  dueDate: string;
  defaultAccountId?: number | null;
  notes?: string | null;
};

export type ExpenseUpdateRequest = {
  description?: string;
  categoryId?: number;
  subCategoryId?: number | null;
  expectedAmount?: number;
  amountBehavior?: PlannedAmountBehavior;
  document?: string | null;
  issueDate?: string;
  dueDate?: string;
  defaultAccountId?: number | null;
  notes?: string | null;
};

export type ExpenseSettleRequest = {
  actualAmount: number;
  settledAt: string;
  settledAccountId?: number | null;
  notes?: string | null;
};

export type ExpenseBatchPreviewRequest = {
  description: string;
  categoryId: number;
  subCategoryId?: number | null;
  expectedAmount: number;
  amountBehavior: PlannedAmountBehavior;
  firstDueDate: string;
  monthsToGenerate: number;
  defaultAccountId?: number | null;
  notes?: string | null;
};

export type ExpenseBatchPreviewEntry = {
  order: number;
  issueDate: string;
  dueDate: string;
  expectedAmount: number;
  adjustedAutomatically?: boolean;
  originalDueDate?: string | null;
};

export type ExpenseBatchPreviewResponse = {
  entries: ExpenseBatchPreviewEntry[];
};

export type ExpenseBatchConfirmEntry = {
  order: number;
  document?: string | null;
  issueDate: string;
  dueDate: string;
  expectedAmount: number;
};

export type ExpenseBatchCreateRequest = {
  description: string;
  document?: string | null;
  categoryId: number;
  subCategoryId?: number | null;
  amountBehavior: PlannedAmountBehavior;
  defaultAccountId?: number | null;
  notes?: string | null;
  entries: ExpenseBatchConfirmEntry[];
};

export type ExpenseCreateResponse = {
  id: string;
  direction: FinancialDirection;
  description: string;
  categoryId: string;
  subCategoryId?: string | null;
  expectedAmount: number;
  amountBehavior: PlannedAmountBehavior;
  document?: string | null;
  issueDate: string;
  dueDate: string;
  status?: PlannedEntryStatus;
  notes?: string | null;
};

export type ExpenseBatchCreateResponse = {
  groupId: string;
  entries: ExpenseCreateResponse[];
};

export type ExpenseRecord = {
  id: string;
  direction: FinancialDirection;
  description: string;
  categoryId: string;
  subCategoryId?: string | null;
  expectedAmount: number;
  amountBehavior: PlannedAmountBehavior;
  document?: string | null;
  issueDate: string;
  dueDate: string;
  status: PlannedEntryStatus;
  notes?: string | null;
  actualAmount?: number | null;
  defaultAccountId?: string | null;
  settledAccountId?: string | null;
  settledAt?: string | null;
  groupId?: string | null;
  categoryName?: string | null;
  subCategoryName?: string | null;
};
