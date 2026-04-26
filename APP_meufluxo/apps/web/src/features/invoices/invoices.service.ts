import type { InvoicesListParams } from "@meufluxo/api-client";
import type {
  Invoice,
  InvoiceChargesUpdateRequest,
  InvoiceDetails,
  InvoiceExpenseItem,
  InvoicePaymentCreateRequest,
  InvoicePaymentItem,
  InvoiceStatus,
  PageQueryParams,
  PageResponse,
} from "@meufluxo/types";

import { env } from "@/lib/env";
import { api } from "@/services/api";
import { mockInvoiceDetailsById, mockInvoices } from "@/services/mocks/invoices";
import { normalizeCardBrand } from "@/constants/card-brands";

function toNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function toStringOrEmpty(value: unknown): string {
  return value == null ? "" : String(value);
}

function toStatus(value: unknown): InvoiceStatus {
  const status = String(value ?? "").toUpperCase();
  if (
    status === "OPEN" ||
    status === "CLOSED" ||
    status === "PAID" ||
    status === "PARTIALLY_PAID" ||
    status === "OVERDUE"
  ) {
    return status;
  }
  return "OPEN";
}

function buildCardDisplayName(
  name: string,
  brand: ReturnType<typeof normalizeCardBrand>,
): string | null {
  const normalizedName = String(name ?? "").trim();
  if (!normalizedName) return brand;
  if (!brand) return normalizedName;
  return `${normalizedName} - ${brand}`;
}

function normalizeInvoice(raw: unknown): Invoice {
  const r = raw as Record<string, unknown>;
  const creditCardName = toStringOrEmpty(r.creditCardName) || "—";
  const creditCardBrand = normalizeCardBrand(r.creditCardBrand ?? r.brand ?? r.brandCard);
  const fallbackDisplayName = buildCardDisplayName(creditCardName, creditCardBrand);
  return {
    id: toStringOrEmpty(r.id),
    creditCardId: toStringOrEmpty(r.creditCardId),
    creditCardName,
    creditCardBrand,
    cardDisplayName:
      r.cardDisplayName != null && String(r.cardDisplayName).trim() !== ""
        ? String(r.cardDisplayName)
        : fallbackDisplayName,
    referenceLabel: toStringOrEmpty(r.referenceLabel) || "—",
    periodStart: r.periodStart != null ? String(r.periodStart) : null,
    periodEnd: r.periodEnd != null ? String(r.periodEnd) : null,
    closingDate: r.closingDate != null ? String(r.closingDate) : null,
    dueDate: toStringOrEmpty(r.dueDate),
    purchasesAmount: toNumber(r.purchasesAmount),
    previousBalance: toNumber(r.previousBalance),
    interestAmount: toNumber(r.interestAmount),
    lateFeeAmount: toNumber(r.lateFeeAmount),
    otherFeesAmount: toNumber(r.otherFeesAmount),
    totalAmount: toNumber(r.totalAmount),
    paidAmount: toNumber(r.paidAmount),
    remainingAmount: toNumber(r.remainingAmount),
    status: toStatus(r.status),
    statusLabel:
      r.statusLabel != null && String(r.statusLabel).trim() !== "" ? String(r.statusLabel) : null,
    canClose: r.canClose != null ? Boolean(r.canClose) : undefined,
    canPay: r.canPay != null ? Boolean(r.canPay) : undefined,
    canEditCharges: r.canEditCharges != null ? Boolean(r.canEditCharges) : undefined,
    canEditExpenses: r.canEditExpenses != null ? Boolean(r.canEditExpenses) : undefined,
    canReopen: r.canReopen != null ? Boolean(r.canReopen) : undefined,
  };
}

function normalizeInvoiceExpenseItem(raw: unknown): InvoiceExpenseItem {
  const r = raw as Record<string, unknown>;
  const installmentNumberRaw = r.installmentNumber ?? r.installment_number;
  const installmentCountRaw = r.installmentCount ?? r.installment_count;
  const installmentLabelRaw =
    r.installmentLabel != null && String(r.installmentLabel).trim() !== ""
      ? String(r.installmentLabel)
      : r.installment_label != null && String(r.installment_label).trim() !== ""
        ? String(r.installment_label)
      : null;
  const installmentNumber =
    installmentNumberRaw != null && Number.isFinite(Number(installmentNumberRaw))
      ? Number(installmentNumberRaw)
      : null;
  const installmentCount =
    installmentCountRaw != null && Number.isFinite(Number(installmentCountRaw))
      ? Number(installmentCountRaw)
      : null;
  const installmentLabel =
    installmentLabelRaw ??
    (installmentNumber != null && installmentCount != null
      ? `${installmentNumber}/${installmentCount}`
      : null);
  return {
    id: toStringOrEmpty(r.id),
    description: toStringOrEmpty(r.description) || "—",
    categoryName: toStringOrEmpty(r.categoryName) || "—",
    subCategoryName:
      r.subCategoryName != null
        ? String(r.subCategoryName)
        : r.subcategoryName != null
          ? String(r.subcategoryName)
          : null,
    purchaseDate: toStringOrEmpty(r.purchaseDate),
    installmentLabel,
    installmentNumber,
    installmentCount,
    amount: toNumber(r.amount),
    status:
      String(r.status ?? "").toUpperCase() === "CANCELED"
        ? "CANCELED"
        : String(r.status ?? "").toUpperCase() === "PAID"
          ? "PAID"
          : String(r.status ?? "").toUpperCase() === "OPEN"
            ? "OPEN"
            : String(r.status ?? "").toUpperCase() === "INVOICED"
              ? "INVOICED"
              : toStatus(r.status),
  };
}

function normalizeInvoicePaymentItem(raw: unknown): InvoicePaymentItem {
  const r = raw as Record<string, unknown>;
  return {
    id: toStringOrEmpty(r.id),
    paymentDate: toStringOrEmpty(r.paymentDate),
    accountId: r.accountId != null ? String(r.accountId) : null,
    accountName: toStringOrEmpty(r.accountName) || "—",
    amount: toNumber(r.amount),
    notes: r.notes != null ? String(r.notes) : null,
    movementId: r.movementId != null ? String(r.movementId) : null,
  };
}

function normalizeInvoiceDetails(raw: unknown): InvoiceDetails {
  const r = raw as Record<string, unknown>;
  const base = normalizeInvoice(raw);
  const expensesRaw = Array.isArray(r.expenses) ? r.expenses : [];
  const paymentsRaw = Array.isArray(r.payments) ? r.payments : [];
  return {
    ...base,
    expenses: expensesRaw.map((item) => normalizeInvoiceExpenseItem(item)),
    payments: paymentsRaw.map((item) => normalizeInvoicePaymentItem(item)),
  };
}

function normalizePage(rawPage: unknown): PageResponse<Invoice> {
  const page = (rawPage ?? {}) as Record<string, unknown>;
  const rawContent = Array.isArray(page.content) ? page.content : [];
  const resolvedSize = toNumber(page.size);
  const resolvedPage = page.page != null ? toNumber(page.page) : toNumber(page.number);
  const totalElements = toNumber(page.totalElements);
  const totalPages =
    page.totalPages != null
      ? toNumber(page.totalPages)
      : resolvedSize > 0
        ? Math.ceil(totalElements / resolvedSize)
        : 0;

  const normalizedContent = rawContent.map((item) => normalizeInvoice(item));
  const adjustedById = new Map<string, number>();

  const byCard = new Map<string, Invoice[]>();
  normalizedContent.forEach((invoice) => {
    const list = byCard.get(invoice.creditCardId) ?? [];
    list.push(invoice);
    byCard.set(invoice.creditCardId, list);
  });

  byCard.forEach((items) => {
    const sorted = [...items].sort((a, b) => String(a.dueDate).localeCompare(String(b.dueDate)));
    sorted.forEach((invoice, index) => {
      if (index === 0) {
        adjustedById.set(invoice.id, 0);
        return;
      }
      const previousInvoice = sorted[index - 1];
      const hasCarryOverFromPrevious =
        previousInvoice.status === "PARTIALLY_PAID" &&
        previousInvoice.paidAmount > 0 &&
        previousInvoice.remainingAmount > 0;
      adjustedById.set(
        invoice.id,
        hasCarryOverFromPrevious ? invoice.previousBalance : 0,
      );
    });
  });

  return {
    content: normalizedContent.map((invoice) => ({
      ...invoice,
      previousBalance: adjustedById.get(invoice.id) ?? 0,
    })),
    page: resolvedPage,
    size: resolvedSize,
    totalElements,
    totalPages,
    first: page.first != null ? Boolean(page.first) : resolvedPage <= 0,
    last:
      page.last != null
        ? Boolean(page.last)
        : totalPages <= 1 || resolvedPage >= Math.max(totalPages - 1, 0),
  };
}

function toMockPage(params: PageQueryParams): PageResponse<Invoice> {
  const size = Math.max(1, Number(params.size) || 10);
  const page = Math.max(0, Number(params.page) || 0);
  const start = page * size;
  const end = start + size;
  const content = mockInvoices.slice(start, end);
  const totalElements = mockInvoices.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / size));

  return {
    content,
    page,
    size,
    totalElements,
    totalPages,
    first: page <= 0,
    last: page >= totalPages - 1,
  };
}

export async function fetchInvoicesPage(
  params: PageQueryParams & {
    creditCardId?: string;
    status?: string;
    dueDateStart?: string;
    dueDateEnd?: string;
  },
): Promise<PageResponse<Invoice>> {
  if (env.useMocks) {
    return toMockPage(params);
  }

  const query: InvoicesListParams = {
    page: params.page,
    size: params.size,
    ...(params.sort ? { sort: params.sort } : {}),
    ...(params.creditCardId ? { creditCardId: params.creditCardId } : {}),
    ...(params.status ? { status: params.status } : {}),
    ...(params.dueDateStart ? { dueDateStart: params.dueDateStart } : {}),
    ...(params.dueDateEnd ? { dueDateEnd: params.dueDateEnd } : {}),
  };

  const pageResponse = await api.invoices.list(query);
  return normalizePage(pageResponse);
}

export async function fetchInvoiceDetailsById(id: string): Promise<InvoiceDetails> {
  if (env.useMocks) {
    return mockInvoiceDetailsById[id] ?? {
      ...mockInvoices[0],
      id,
      expenses: [],
      payments: [],
    };
  }
  const details = await api.invoices.getById(id);
  return normalizeInvoiceDetails(details);
}

export async function closeInvoiceById(id: string): Promise<InvoiceDetails> {
  if (env.useMocks) {
    const current = await fetchInvoiceDetailsById(id);
    return {
      ...current,
      status: "CLOSED",
      canClose: false,
    };
  }
  const updated = await api.invoices.close(id);
  return normalizeInvoiceDetails(updated);
}

export async function reopenInvoiceById(id: string): Promise<InvoiceDetails> {
  if (env.useMocks) {
    const current = await fetchInvoiceDetailsById(id);
    return {
      ...current,
      status: "OPEN",
      canClose: true,
      canReopen: false,
    };
  }
  const updated = await api.invoices.reopen(id);
  return normalizeInvoiceDetails(updated);
}

export async function createInvoicePayment(
  id: string,
  request: InvoicePaymentCreateRequest,
): Promise<InvoiceDetails> {
  if (env.useMocks) {
    const current = await fetchInvoiceDetailsById(id);
    const nextPaidAmount = current.paidAmount + request.amount;
    const nextRemaining = Math.max(0, current.totalAmount - nextPaidAmount);
    return {
      ...current,
      paidAmount: nextPaidAmount,
      remainingAmount: nextRemaining,
      status: nextRemaining <= 0 ? "PAID" : "PARTIALLY_PAID",
      payments: [
        ...current.payments,
        {
          id: `inv_pay_${Date.now()}`,
          paymentDate: request.paymentDate,
          accountId: String(request.accountId),
          accountName: "Conta selecionada",
          amount: request.amount,
          notes: request.notes ?? null,
          movementId: null,
        },
      ],
    };
  }
  const updated = await api.invoices.createPayment(id, request);
  return normalizeInvoiceDetails(updated);
}

export async function deleteInvoicePaymentById(paymentId: string): Promise<void> {
  if (env.useMocks) {
    return;
  }
  await api.invoices.deletePaymentById(paymentId);
}

export async function updateInvoiceCharges(
  id: string,
  request: InvoiceChargesUpdateRequest,
): Promise<InvoiceDetails> {
  if (env.useMocks) {
    const current = await fetchInvoiceDetailsById(id);
    const totalAmount =
      current.purchasesAmount +
      current.previousBalance +
      request.interestAmount +
      request.lateFeeAmount +
      request.otherFeesAmount;
    const remainingAmount = Math.max(0, totalAmount - current.paidAmount);
    return {
      ...current,
      interestAmount: request.interestAmount,
      lateFeeAmount: request.lateFeeAmount,
      otherFeesAmount: request.otherFeesAmount,
      totalAmount,
      remainingAmount,
    };
  }
  const updated = await api.invoices.updateCharges(id, request);
  return normalizeInvoiceDetails(updated);
}
