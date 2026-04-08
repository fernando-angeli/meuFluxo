"use client";

import type {
  CreditCardInvoiceDetails,
  CreditCardInvoiceDetailsExpenseItem,
  CreditCardInvoiceDetailsPaymentItem,
  CreditCardInvoiceListItem,
  CreditCardInvoicePayment,
  ID,
  InvoiceStatus,
  PageQueryParams,
  PageResponse,
} from "@meufluxo/types";
import type { InvoiceCreatePaymentRequest } from "@meufluxo/api-client";

import { api } from "@/services/api";
import { env } from "@/lib/env";
import { mockInvoiceDetailsById, mockInvoices } from "@/services/mocks/invoices";

type UnknownRecord = Record<string, unknown>;

function asNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (value == null || value === "") return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function asNullableString(value: unknown): string | null {
  if (value == null) return null;
  const str = String(value).trim();
  return str ? str : null;
}

function normalizeStatus(value: unknown): InvoiceStatus {
  const v = String(value ?? "").toUpperCase();
  if (v === "CLOSED") return "CLOSED";
  if (v === "PAID") return "PAID";
  if (v === "PARTIALLY_PAID") return "PARTIALLY_PAID";
  if (v === "OVERDUE") return "OVERDUE";
  return "OPEN";
}

function normalizeId(value: unknown): ID {
  return String(value ?? "");
}

export function normalizeInvoiceFromApi(raw: unknown): CreditCardInvoiceListItem {
  const r = raw as UnknownRecord;
  return {
    id: normalizeId(r.id),
    creditCardId: normalizeId(r.creditCardId),
    creditCardName: String(r.creditCardName ?? ""),
    cardDisplayName: asNullableString(r.cardDisplayName),
    referenceLabel: String(r.referenceLabel ?? ""),
    dueDate: String(r.dueDate ?? ""),
    purchasesAmount: asNumber(r.purchasesAmount),
    previousBalance: asNumber(r.previousBalance),
    totalAmount: asNumber(r.totalAmount),
    paidAmount: asNumber(r.paidAmount),
    remainingAmount: asNumber(r.remainingAmount),
    status: normalizeStatus(r.status),
    statusLabel: asNullableString(r.statusLabel),
  };
}

function normalizeExpenseItem(raw: unknown): CreditCardInvoiceDetailsExpenseItem {
  const r = raw as UnknownRecord;
  return {
    id: normalizeId(r.id),
    description: String(r.description ?? ""),
    purchaseDate: String(r.purchaseDate ?? ""),
    categoryId: r.categoryId != null ? normalizeId(r.categoryId) : null,
    categoryName: asNullableString(r.categoryName),
    subcategoryId: r.subcategoryId != null ? normalizeId(r.subcategoryId) : null,
    subcategoryName: asNullableString(r.subcategoryName),
    amount: asNumber(r.amount),
    installmentNumber:
      r.installmentNumber != null ? Number(r.installmentNumber) : null,
    installmentCount: r.installmentCount != null ? Number(r.installmentCount) : null,
    installmentGroupId: asNullableString(r.installmentGroupId),
    status: String(r.status ?? ""),
    statusLabel: asNullableString(r.statusLabel),
  };
}

function normalizePaymentItem(raw: unknown): CreditCardInvoiceDetailsPaymentItem {
  const r = raw as UnknownRecord;
  return {
    id: normalizeId(r.id),
    accountId: r.accountId != null ? normalizeId(r.accountId) : null,
    accountName: asNullableString(r.accountName),
    paymentDate: String(r.paymentDate ?? ""),
    amount: asNumber(r.amount),
    notes: asNullableString(r.notes),
  };
}

export function normalizeInvoiceDetailsFromApi(raw: unknown): CreditCardInvoiceDetails {
  const r = raw as UnknownRecord;
  return {
    id: normalizeId(r.id),
    creditCardId: normalizeId(r.creditCardId),
    creditCardName: String(r.creditCardName ?? ""),
    cardDisplayName: asNullableString(r.cardDisplayName),
    creditCardBrand:
      String(r.creditCardBrand ?? "") === "MASTERCARD"
        ? "MASTERCARD"
        : String(r.creditCardBrand ?? "") === "VISA"
          ? "VISA"
          : null,
    closingDay: r.closingDay != null ? Number(r.closingDay) : null,
    dueDay: r.dueDay != null ? Number(r.dueDay) : null,
    referenceYear: r.referenceYear != null ? Number(r.referenceYear) : null,
    referenceMonth: r.referenceMonth != null ? Number(r.referenceMonth) : null,
    referenceLabel: String(r.referenceLabel ?? ""),
    periodStart: asNullableString(r.periodStart),
    periodEnd: asNullableString(r.periodEnd),
    closingDate: asNullableString(r.closingDate),
    dueDate: asNullableString(r.dueDate),
    purchasesAmount: asNumber(r.purchasesAmount),
    previousBalance: asNumber(r.previousBalance),
    revolvingInterest: asNumber(r.revolvingInterest),
    lateFee: asNumber(r.lateFee),
    otherCharges: asNumber(r.otherCharges),
    totalAmount: asNumber(r.totalAmount),
    paidAmount: asNumber(r.paidAmount),
    remainingAmount: asNumber(r.remainingAmount),
    currentBalance: asNumber(r.currentBalance),
    status: normalizeStatus(r.status),
    statusLabel: asNullableString(r.statusLabel),
    canClose: Boolean(r.canClose),
    canPay: Boolean(r.canPay),
    canEditCharges: Boolean(r.canEditCharges),
    canEditExpenses: Boolean(r.canEditExpenses),
    expenses: Array.isArray(r.expenses) ? r.expenses.map(normalizeExpenseItem) : [],
    payments: Array.isArray(r.payments) ? r.payments.map(normalizePaymentItem) : [],
  };
}

function normalizeInvoicePayment(raw: unknown): CreditCardInvoicePayment {
  const r = raw as UnknownRecord;
  return {
    id: normalizeId(r.id),
    invoiceId: normalizeId(r.invoiceId),
    invoiceReference: asNullableString(r.invoiceReference),
    accountId: r.accountId != null ? normalizeId(r.accountId) : null,
    accountName: asNullableString(r.accountName),
    paymentDate: String(r.paymentDate ?? ""),
    amount: asNumber(r.amount),
    notes: asNullableString(r.notes),
    movementId: r.movementId != null ? normalizeId(r.movementId) : null,
    active: Boolean(r.active),
    createdAt: asNullableString(r.createdAt),
    updatedAt: asNullableString(r.updatedAt),
  };
}

function normalizePage<TInput, TOutput>(
  page: PageResponse<TInput>,
  mapFn: (item: TInput) => TOutput,
): PageResponse<TOutput> {
  return {
    ...page,
    content: (page.content ?? []).map(mapFn),
  };
}

function toMockInvoicePage(
  params: PageQueryParams & Record<string, unknown>,
): PageResponse<CreditCardInvoiceListItem> {
  const activeFilter = params.status ? String(params.status) : null;
  const creditCardFilter = params.creditCardId ? String(params.creditCardId) : null;
  const dueDateStart = params.dueDateStart ? String(params.dueDateStart) : null;
  const dueDateEnd = params.dueDateEnd ? String(params.dueDateEnd) : null;

  const filtered = mockInvoices.filter((invoice) => {
    if (activeFilter && activeFilter !== invoice.status) return false;
    if (creditCardFilter && creditCardFilter !== invoice.creditCardId) return false;
    if (dueDateStart && invoice.dueDate < dueDateStart) return false;
    if (dueDateEnd && invoice.dueDate > dueDateEnd) return false;
    return true;
  });

  const start = params.page * params.size;
  const end = start + params.size;
  const pageContent = filtered.slice(start, end);
  const totalElements = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / params.size));

  return {
    content: pageContent,
    page: params.page,
    size: params.size,
    totalElements,
    totalPages,
    first: params.page === 0,
    last: params.page >= totalPages - 1,
  };
}

export async function fetchInvoicesPage(
  params: PageQueryParams & Record<string, unknown>,
): Promise<PageResponse<CreditCardInvoiceListItem>> {
  if (env.useMocks) {
    return toMockInvoicePage(params);
  }

  const page = await api.invoices.list({
    page: params.page,
    size: params.size,
    ...(params.sort ? { sort: String(params.sort) } : {}),
    ...(params.creditCardId ? { creditCardId: String(params.creditCardId) } : {}),
    ...(params.status ? { status: String(params.status) } : {}),
    ...(params.dueDateStart ? { dueDateStart: String(params.dueDateStart) } : {}),
    ...(params.dueDateEnd ? { dueDateEnd: String(params.dueDateEnd) } : {}),
  });

  return normalizePage(page as PageResponse<unknown>, normalizeInvoiceFromApi);
}

export async function fetchInvoiceDetailsById(
  id: string,
): Promise<CreditCardInvoiceDetails> {
  if (env.useMocks) {
    return (
      mockInvoiceDetailsById[id] ?? {
        id,
        creditCardId: "",
        creditCardName: "Cartão",
        cardDisplayName: null,
        creditCardBrand: null,
        closingDay: null,
        dueDay: null,
        referenceYear: null,
        referenceMonth: null,
        referenceLabel: "",
        periodStart: null,
        periodEnd: null,
        closingDate: null,
        dueDate: null,
        purchasesAmount: 0,
        previousBalance: 0,
        revolvingInterest: 0,
        lateFee: 0,
        otherCharges: 0,
        totalAmount: 0,
        paidAmount: 0,
        remainingAmount: 0,
        currentBalance: 0,
        status: "OPEN",
        statusLabel: "Aberta",
        canClose: false,
        canPay: true,
        canEditCharges: false,
        canEditExpenses: false,
        expenses: [],
        payments: [],
      }
    );
  }

  const raw = await api.invoices.getDetails(id);
  return normalizeInvoiceDetailsFromApi(raw);
}

export async function createInvoicePayment(
  request: InvoiceCreatePaymentRequest,
): Promise<CreditCardInvoicePayment> {
  if (env.useMocks) {
    const createdPayment: CreditCardInvoicePayment = {
      id: `pay_${Date.now()}`,
      invoiceId: String(request.invoiceId),
      invoiceReference: null,
      accountId: String(request.accountId),
      accountName: null,
      paymentDate: request.paymentDate,
      amount: request.amount,
      notes: request.notes ?? null,
      movementId: null,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const invoiceId = String(request.invoiceId);
    const details = mockInvoiceDetailsById[invoiceId];
    if (details) {
      const nextPaid = details.paidAmount + request.amount;
      const totalAmount = details.totalAmount;
      const nextRemaining = Math.max(0, totalAmount - nextPaid);
      const nextStatus: InvoiceStatus =
        nextRemaining <= 0 ? "PAID" : nextPaid > 0 ? "PARTIALLY_PAID" : "OPEN";
      const nextStatusLabel =
        nextStatus === "PAID"
          ? "Quitada"
          : nextStatus === "PARTIALLY_PAID"
            ? "Pagamento parcial"
            : "Aberta";

      details.paidAmount = nextPaid;
      details.remainingAmount = nextRemaining;
      details.currentBalance = nextRemaining;
      details.status = nextStatus;
      details.statusLabel = nextStatusLabel;
      details.canPay = nextRemaining > 0;
      details.payments = [
        {
          id: createdPayment.id,
          accountId: createdPayment.accountId,
          accountName: createdPayment.accountName,
          paymentDate: createdPayment.paymentDate,
          amount: createdPayment.amount,
          notes: createdPayment.notes,
        },
        ...details.payments,
      ];

      const listItem = mockInvoices.find((item) => item.id === invoiceId);
      if (listItem) {
        listItem.paidAmount = nextPaid;
        listItem.remainingAmount = nextRemaining;
        listItem.status = nextStatus;
        listItem.statusLabel = nextStatusLabel;
      }
    }
    return createdPayment;
  }
  const raw = await api.invoices.createPayment(request);
  return normalizeInvoicePayment(raw);
}
