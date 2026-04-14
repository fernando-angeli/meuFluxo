"use client";

import type { CreditCard, PageQueryParams, PageResponse } from "@meufluxo/types";

import { env } from "@/lib/env";
import { api } from "@/services/api";
import { mockCreditCards } from "@/services/mocks/credit-cards";

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

  const allCards = env.useMocks ? mockCreditCards : await api.creditCards.list();
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
