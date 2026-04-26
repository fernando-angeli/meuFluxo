"use client";

import type {
  BrandCard,
  CreditCard,
  PageQueryParams,
  PageResponse,
} from "@meufluxo/types";

import { env } from "@/lib/env";
import { api } from "@/services/api";
import { mockCreditCards } from "@/services/mocks/credit-cards";
import { normalizeCardBrand, toApiCardBrand } from "@/constants/card-brands";

/** Em modo mock, ids removidos para refletir exclusão na lista sem backend. */
const mockDeletedCreditCardIds = new Set<string>();

function getEffectiveMockCreditCards(): CreditCard[] {
  return mockCreditCards.filter((c) => !mockDeletedCreditCardIds.has(String(c.id)));
}

/** Lista mock efetiva (respeita exclusões locais) para hooks e telas em modo demo. */
export function getMockCreditCardsSnapshot(): CreditCard[] {
  return getEffectiveMockCreditCards();
}

type CreditCardCreateRequest = {
  name: string;
  brand: BrandCard;
  closingDay: number;
  dueDay: number;
  creditLimit?: number | null;
  defaultPaymentAccountId?: number | null;
  notes?: string | null;
  active: boolean;
};

type CreditCardUpdateRequest = CreditCardCreateRequest;

type CreditCardActiveRequest = {
  active: boolean;
};

function toStringOrEmpty(value: unknown): string {
  return value == null ? "" : String(value);
}

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toNullableNumber(value: unknown): number | null {
  if (value == null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function isNotFoundError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    Number((error as { status?: unknown }).status) === 404
  );
}

function resolveActiveFlag(r: Record<string, unknown>): boolean {
  const meta = r.meta as Record<string, unknown> | undefined;
  if (meta && typeof meta.active === "boolean") return meta.active;
  if (typeof r.active === "boolean") return r.active;
  return true;
}

export function normalizeCreditCardFromApi(raw: unknown): CreditCard {
  const r = raw as Record<string, unknown>;
  const resolvedBrand = normalizeCardBrand(r.brand ?? r.brandCard) ?? "Outro";
  const cardName = toStringOrEmpty(r.name);
  return {
    id: toStringOrEmpty(r.id),
    name: cardName,
    cardDisplayName:
      r.cardDisplayName != null && String(r.cardDisplayName).trim() !== ""
        ? String(r.cardDisplayName)
        : cardName
          ? `${cardName} - ${resolvedBrand}`
          : resolvedBrand,
    brand: resolvedBrand,
    brandCard: resolvedBrand,
    creditLimit: toNullableNumber(r.creditLimit),
    closingDay: toNumber(r.closingDay),
    dueDay: toNumber(r.dueDay),
    defaultPaymentAccountId:
      r.defaultPaymentAccountId != null ? String(r.defaultPaymentAccountId) : null,
    defaultPaymentAccountName:
      r.defaultPaymentAccountName != null ? String(r.defaultPaymentAccountName) : null,
    notes: r.notes != null ? String(r.notes) : null,
    meta: {
      createdAt: String((r.meta as { createdAt?: string } | undefined)?.createdAt ?? new Date().toISOString()),
      updatedAt: String((r.meta as { updatedAt?: string } | undefined)?.updatedAt ?? new Date().toISOString()),
      active: resolveActiveFlag(r),
    },
    lastFourDigits: r.lastFourDigits != null ? String(r.lastFourDigits) : null,
    annualFeeEnabled: r.annualFeeEnabled != null ? Boolean(r.annualFeeEnabled) : null,
    annualFeeAmount: toNullableNumber(r.annualFeeAmount),
    annualFeeWaiverThreshold: toNullableNumber(r.annualFeeWaiverThreshold),
  };
}

function toSortParts(sort?: string): { key: string; direction: "asc" | "desc" } {
  if (!sort) return { key: "name", direction: "asc" };
  const [key, directionRaw] = sort.split(",");
  const direction = String(directionRaw ?? "ASC").toLowerCase() === "desc" ? "desc" : "asc";
  return { key: key || "name", direction };
}

function getSortableValue(card: CreditCard, key: string): string | number {
  switch (key) {
    case "name":
      return card.name ?? "";
    case "brandCard":
      return card.brandCard ?? "";
    case "closingDay":
      return card.closingDay ?? 0;
    case "dueDay":
      return card.dueDay ?? 0;
    case "creditLimit":
      return card.creditLimit ?? 0;
    case "status":
      return card.meta.active ? 1 : 0;
    default:
      return card.name ?? "";
  }
}

function compareCards(a: CreditCard, b: CreditCard, key: string, direction: "asc" | "desc"): number {
  const va = getSortableValue(a, key);
  const vb = getSortableValue(b, key);
  const base =
    typeof va === "number" && typeof vb === "number"
      ? va - vb
      : String(va).localeCompare(String(vb), "pt-BR", { sensitivity: "base" });
  return direction === "asc" ? base : -base;
}

export async function fetchCreditCardsPage(params: PageQueryParams): Promise<PageResponse<CreditCard>> {
  const page = Math.max(0, Number(params.page) || 0);
  const size = Math.max(1, Number(params.size) || 10);
  const { key, direction } = toSortParts(params.sort);

  const allCards = env.useMocks
    ? getEffectiveMockCreditCards()
    : await (async () => {
        try {
          const pageResponse = await api.creditCards.list();
          return (pageResponse?.content ?? []).map((item) => normalizeCreditCardFromApi(item));
        } catch (error) {
          // Alguns ambientes respondem 404 quando nao existem cartoes.
          // Para listagem, tratamos como "sem registros".
          if (isNotFoundError(error)) return [];
          throw error;
        }
      })();
  const sorted = [...allCards].sort((a, b) => compareCards(a, b, key, direction));

  const totalElements = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / size));
  const start = page * size;
  const end = start + size;

  return {
    content: sorted.slice(start, end),
    page,
    size,
    totalElements,
    totalPages,
    first: page <= 0,
    last: page >= totalPages - 1,
  };
}

export async function createCreditCard(request: CreditCardCreateRequest): Promise<CreditCard> {
  const created = await api.creditCards.create({
    ...request,
    brand: toApiCardBrand(request.brand) as unknown as BrandCard,
  });
  return normalizeCreditCardFromApi(created);
}

export async function updateCreditCard(
  id: string,
  request: CreditCardUpdateRequest,
): Promise<CreditCard> {
  const updated = await api.creditCards.update(id, {
    ...request,
    brand: toApiCardBrand(request.brand) as unknown as BrandCard,
  });
  let normalized = normalizeCreditCardFromApi(updated);
  if (!env.useMocks && normalized.meta.active !== request.active) {
    const patched = await api.creditCards.updateActive(id, { active: request.active });
    normalized = normalizeCreditCardFromApi(patched);
  }
  return normalized;
}

export async function updateCreditCardActive(
  id: string,
  request: CreditCardActiveRequest,
): Promise<CreditCard> {
  const updated = await api.creditCards.updateActive(id, request);
  return normalizeCreditCardFromApi(updated);
}

export async function deleteCreditCard(id: string): Promise<void> {
  const idStr = String(id);
  if (env.useMocks) {
    mockDeletedCreditCardIds.add(idStr);
    return;
  }
  await api.creditCards.deleteById(idStr);
}
