"use client";

import type {
  CreditCard,
  CreditCardId,
  PageQueryParams,
  PageResponse,
} from "@meufluxo/types";
import type {
  CreditCardActiveRequest,
  CreditCardCreateRequest,
  CreditCardUpdateRequest,
} from "@meufluxo/api-client";

import { api } from "@/services/api";

type UnknownRecord = Record<string, unknown>;

export function normalizeCreditCardFromApi(raw: unknown): CreditCard {
  const record = raw as UnknownRecord;
  const active =
    typeof record.active === "boolean"
      ? record.active
      : Boolean((record.meta as UnknownRecord | undefined)?.active);
  const createdAt =
    (record.createdAt as string | undefined) ??
    ((record.meta as UnknownRecord | undefined)?.createdAt as string | undefined) ??
    "";
  const updatedAt =
    (record.updatedAt as string | undefined) ??
    ((record.meta as UnknownRecord | undefined)?.updatedAt as string | undefined) ??
    "";
  const brandRaw =
    (record.brand as string | undefined) ??
    (record.brandCard as string | undefined) ??
    "VISA";
  const brand = brandRaw === "MASTERCARD" ? "MASTERCARD" : "VISA";

  return {
    id: String(record.id ?? ""),
    name: String(record.name ?? ""),
    cardDisplayName:
      record.cardDisplayName != null ? String(record.cardDisplayName) : null,
    brand,
    brandCard: brand,
    creditLimit:
      typeof record.creditLimit === "number"
        ? record.creditLimit
        : record.creditLimit != null
          ? Number(record.creditLimit)
          : null,
    closingDay:
      typeof record.closingDay === "number" ? record.closingDay : Number(record.closingDay ?? 1),
    dueDay: typeof record.dueDay === "number" ? record.dueDay : Number(record.dueDay ?? 1),
    defaultPaymentAccountId:
      record.defaultPaymentAccountId != null
        ? String(record.defaultPaymentAccountId)
        : null,
    defaultPaymentAccountName:
      record.defaultPaymentAccountName != null
        ? String(record.defaultPaymentAccountName)
        : null,
    notes: record.notes != null ? String(record.notes) : null,
    meta: {
      active,
      createdAt,
      updatedAt,
    },
  };
}

function normalizePage(page: PageResponse<unknown>): PageResponse<CreditCard> {
  return {
    ...page,
    content: (page.content ?? []).map((item) => normalizeCreditCardFromApi(item)),
  };
}

export async function fetchCreditCardsPage(
  params: PageQueryParams & Record<string, unknown>,
): Promise<PageResponse<CreditCard>> {
  const page = await api.creditCards.list({
    page: params.page,
    size: params.size,
    ...(params.sort ? { sort: String(params.sort) } : {}),
    ...(typeof params.active === "boolean" ? { active: params.active } : {}),
  });
  return normalizePage(page as PageResponse<unknown>);
}

export async function createCreditCard(
  request: CreditCardCreateRequest,
): Promise<CreditCard> {
  const raw = await api.creditCards.create(request);
  return normalizeCreditCardFromApi(raw);
}

export async function updateCreditCard(
  id: CreditCardId,
  request: CreditCardUpdateRequest,
): Promise<CreditCard> {
  const raw = await api.creditCards.update(id, request);
  return normalizeCreditCardFromApi(raw);
}

export async function updateCreditCardActive(
  id: CreditCardId,
  request: CreditCardActiveRequest,
): Promise<CreditCard> {
  const raw = await api.creditCards.updateActive(id, request);
  return normalizeCreditCardFromApi(raw);
}
