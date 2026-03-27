"use client";

import type {
  ExpenseBatchCreateRequest,
  ExpenseBatchCreateResponse,
  ExpenseBatchPreviewEntry,
  ExpenseBatchPreviewRequest,
  ExpenseBatchPreviewResponse,
  ExpenseCreateRequest,
  ExpenseCreateResponse,
  ExpenseUpdateRequest,
} from "@meufluxo/types";

import { api } from "@/services/api";

function toNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function normalizePreviewEntry(raw: unknown, index: number): ExpenseBatchPreviewEntry {
  const r = raw as Record<string, unknown>;
  const dueDate = String(r.dueDate ?? "");
  const originalDueDate =
    r.originalDueDate != null && String(r.originalDueDate).trim() !== ""
      ? String(r.originalDueDate)
      : null;

  return {
    order: toNumber(r.order ?? r.installment ?? index + 1),
    dueDate,
    expectedAmount: toNumber(r.expectedAmount ?? r.amount),
    adjustedAutomatically:
      Boolean(r.adjustedAutomatically ?? r.autoAdjusted) ||
      (Boolean(originalDueDate) && originalDueDate !== dueDate),
    originalDueDate,
  };
}

function normalizePreviewResponse(raw: unknown): ExpenseBatchPreviewResponse {
  const r = raw as Record<string, unknown>;
  const entriesRaw = Array.isArray(r.entries) ? r.entries : [];
  return {
    entries: entriesRaw.map((item, index) => normalizePreviewEntry(item, index)),
  };
}

function normalizeCreatedExpense(raw: unknown): ExpenseCreateResponse {
  const r = raw as Record<string, unknown>;
  return {
    id: String(r.id ?? ""),
    direction: String(r.direction ?? "EXPENSE") as ExpenseCreateResponse["direction"],
    description: String(r.description ?? ""),
    categoryId: String(r.categoryId ?? ""),
    subCategoryId: r.subCategoryId != null ? String(r.subCategoryId) : null,
    expectedAmount: toNumber(r.expectedAmount),
    amountBehavior: String(r.amountBehavior ?? "FIXED") as ExpenseCreateResponse["amountBehavior"],
    dueDate: String(r.dueDate ?? ""),
  };
}

function normalizeBatchCreateResponse(raw: unknown): ExpenseBatchCreateResponse {
  const r = raw as Record<string, unknown>;
  const entriesRaw = Array.isArray(r.entries) ? r.entries : [];
  return {
    groupId: String(r.groupId ?? ""),
    entries: entriesRaw.map((item) => normalizeCreatedExpense(item)),
  };
}

export async function createSingleExpense(
  request: ExpenseCreateRequest,
): Promise<ExpenseCreateResponse> {
  const raw = await api.expenses.createSingle(request);
  return normalizeCreatedExpense(raw);
}

export async function updateExpense(
  id: string,
  request: ExpenseUpdateRequest,
): Promise<ExpenseCreateResponse> {
  const raw = await api.expenses.update(id, request);
  return normalizeCreatedExpense(raw);
}

export async function previewExpenseBatch(
  request: ExpenseBatchPreviewRequest,
): Promise<ExpenseBatchPreviewResponse> {
  const raw = await api.expenses.previewBatch(request);
  return normalizePreviewResponse(raw);
}

export async function createExpenseBatch(
  request: ExpenseBatchCreateRequest,
): Promise<ExpenseBatchCreateResponse> {
  const raw = await api.expenses.createBatch(request);
  return normalizeBatchCreateResponse(raw);
}
