import type { AccountType } from "./accounts";
import type { CreditCardExpenseStatus } from "./credit-card-expenses";
import type { BrandCard } from "./credit-cards";
import type { CreditCardExpenseStatus } from "./credit-card-expenses";
import type { UserLanguage, UserTheme, WorkspaceMembershipRole } from "./session";

export type CreditCardInstallmentStatus =
  | "OPEN"
  | "INVOICED"
  | "PAID"
  | "CANCELED";

export type CreditCardInvoiceStatus =
  | "OPEN"
  | "CLOSED"
  | "PAID"
  | "PARTIALLY_PAID"
  | "OVERDUE";

export type CreditCardTransactionStatus = "ACTIVE" | "CANCELED" | "REVERSED";

/**
 * Enum equivalente ao Java `MovementType` (inclui tipos de movimentação/pagamento).
 *
 * Observacao: o projeto ja possui um `MovementType` em `categories.ts`, entao aqui usamos um nome diferente
 * para evitar conflito de exports no barrel do pacote.
 */
export type TransactionMovementType =
  | "INCOME"
  | "EXPENSE"
  | "PIX"
  | "DEBIT"
  | "CASH"
  | "TRANSFER"
  | "BOLETO"
  | "VA"
  | "INVOICE_CREDIT_CARD";

export type ProjectionStatus = "PENDING" | "PAID" | "CANCELED";

export type RecurrenceType =
  | "WEEKLY"
  | "BIWEEKLY"
  | "MONTHLY"
  | "BIMONTHLY"
  | "QUARTERLY"
  | "YEARLY";

/**
 * Alias para ficar alinhado ao enum Java.
 * No frontend, mantemos compatibilidade com o pacote de types que inclui `VIEWER`.
 */
export type WorkspaceRole = WorkspaceMembershipRole;

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  CHECKING: "Conta corrente",
  CREDIT_CARD: "Cartão de crédito",
  CASH: "Dinheiro",
  INVESTMENT: "Investimentos",
  SAVING: "Poupança",
  BENEFIT_CARD: "Vale alimentação ou refeição",
};

export const BRAND_CARD_LABELS: Record<BrandCard, string> = {
  VISA: "Visa",
  MASTERCARD: "Masters",
};

export const CREDIT_CARD_INSTALLMENT_STATUS_LABELS: Record<
  CreditCardInstallmentStatus,
  string
> = {
  OPEN: "Aberta",
  INVOICED: "Na fatura",
  PAID: "Paga",
  CANCELED: "Cancelada",
};

export const CREDIT_CARD_EXPENSE_STATUS_LABELS: Record<
  CreditCardExpenseStatus,
  string
> = {
  OPEN: "Em aberto",
  INVOICED: "Faturada",
  PAID: "Paga",
  CANCELED: "Cancelada",
};

export const CREDIT_CARD_INVOICE_STATUS_LABELS: Record<
  CreditCardInvoiceStatus,
  string
> = {
  OPEN: "Aberta",
  CLOSED: "Fechada",
  PAID: "Paga",
  PARTIALLY_PAID: "Pagamento parcial",
  OVERDUE: "Atrasada",
};

export const CREDIT_CARD_EXPENSE_STATUS_LABELS: Record<
  CreditCardExpenseStatus,
  string
> = {
  OPEN: "Aberta",
  CANCELED: "Cancelada",
};

export const CREDIT_CARD_TRANSACTION_STATUS_LABELS: Record<
  CreditCardTransactionStatus,
  string
> = {
  ACTIVE: "Ativa",
  CANCELED: "Cancelada",
  REVERSED: "Revertida",
};

export const TRANSACTION_MOVEMENT_TYPE_LABELS: Record<
  TransactionMovementType,
  string
> = {
  INCOME: "Receita",
  EXPENSE: "Despesa",
  PIX: "PIX",
  DEBIT: "Débito em conta",
  CASH: "Dinheiro",
  TRANSFER: "Transferência",
  BOLETO: "Boleto",
  VA: "Vale Alimentação",
  INVOICE_CREDIT_CARD: "Fatura de cartão de crédito",
};

export const PROJECTION_STATUS_LABELS: Record<ProjectionStatus, string> = {
  PENDING: "Pendente",
  PAID: "Pago",
  CANCELED: "Cancelado",
};

export const RECURRENCE_TYPE_LABELS: Record<RecurrenceType, string> = {
  WEEKLY: "Semanal",
  BIWEEKLY: "Quinzenal",
  MONTHLY: "Mensal",
  BIMONTHLY: "Bimestral",
  QUARTERLY: "Trimestral",
  YEARLY: "Anual",
};

export const USER_LANGUAGE_LABELS: Record<UserLanguage, string> = {
  "pt-BR": "pt-BR",
  en: "en",
  es: "es",
};

export const USER_THEME_LABELS: Record<UserTheme, string> = {
  light: "light",
  dark: "dark",
  system: "system",
};

export const WORKSPACE_ROLE_LABELS: Record<WorkspaceRole, string> = {
  OWNER: "Gestor",
  ADMIN: "Administrador",
  MEMBER: "Membro",
  VIEWER: "Visualizador",
};

export function getLabel<V extends string>(
  value: V,
  labels: Partial<Record<V, string>>,
): string {
  return labels[value] ?? value;
}

export function getAccountTypeLabel(value: AccountType): string {
  return getLabel(value, ACCOUNT_TYPE_LABELS);
}

export function getBrandCardLabel(value: BrandCard): string {
  return getLabel(value, BRAND_CARD_LABELS);
}

export function getCreditCardInstallmentStatusLabel(
  value: CreditCardInstallmentStatus,
): string {
  return getLabel(value, CREDIT_CARD_INSTALLMENT_STATUS_LABELS);
}

export function getCreditCardExpenseStatusLabel(
  value: CreditCardExpenseStatus,
): string {
  return getLabel(value, CREDIT_CARD_EXPENSE_STATUS_LABELS);
}

export function getCreditCardInvoiceStatusLabel(
  value: CreditCardInvoiceStatus,
): string {
  return getLabel(value, CREDIT_CARD_INVOICE_STATUS_LABELS);
}

export function getCreditCardExpenseStatusLabel(
  value: CreditCardExpenseStatus,
): string {
  return getLabel(value, CREDIT_CARD_EXPENSE_STATUS_LABELS);
}

export function getCreditCardTransactionStatusLabel(
  value: CreditCardTransactionStatus,
): string {
  return getLabel(value, CREDIT_CARD_TRANSACTION_STATUS_LABELS);
}

export function getTransactionMovementTypeLabel(
  value: TransactionMovementType,
): string {
  return getLabel(value, TRANSACTION_MOVEMENT_TYPE_LABELS);
}

export function getProjectionStatusLabel(value: ProjectionStatus): string {
  return getLabel(value, PROJECTION_STATUS_LABELS);
}

export function getRecurrenceTypeLabel(value: RecurrenceType): string {
  return getLabel(value, RECURRENCE_TYPE_LABELS);
}

export function getUserLanguageLabel(value: UserLanguage): string {
  return getLabel(value, USER_LANGUAGE_LABELS);
}

export function getUserThemeLabel(value: UserTheme): string {
  return getLabel(value, USER_THEME_LABELS);
}

export function getWorkspaceRoleLabel(value: WorkspaceRole): string {
  return getLabel(value, WORKSPACE_ROLE_LABELS);
}

