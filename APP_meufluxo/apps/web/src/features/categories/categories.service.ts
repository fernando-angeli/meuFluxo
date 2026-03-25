"use client";

import type { Category, MovementType, PageQueryParams, PageResponse } from "@meufluxo/types";
import type { CategoryCreateRequest, CategoryUpdateRequest } from "@meufluxo/api-client";

import { api } from "@/services/api";

/** Normaliza resposta da API (id numérico, etc.) para o modelo do front. */
export function normalizeCategoryFromApi(raw: unknown): Category {
  const r = raw as Record<string, unknown>;
  const meta = r.meta as Record<string, unknown> | undefined;
  return {
    id: String(r.id ?? ""),
    name: String(r.name ?? ""),
    movementType: r.movementType as MovementType,
    meta: {
      createdAt: String(meta?.createdAt ?? ""),
      updatedAt: String(meta?.updatedAt ?? ""),
      active: Boolean(meta?.active),
    },
    description:
      r.description != null && String(r.description).trim() !== ""
        ? String(r.description)
        : null,
    subCategoryCount:
      typeof r.subCategoryCount === "number"
        ? r.subCategoryCount
        : typeof (r as { subcategoryCount?: unknown }).subcategoryCount === "number"
          ? (r as { subcategoryCount: number }).subcategoryCount
          : null,
  };
}

function normalizePage(page: PageResponse<unknown>): PageResponse<Category> {
  return {
    ...page,
    content: (page.content ?? []).map((item) => normalizeCategoryFromApi(item)),
  };
}

export async function fetchCategoriesPage(
  params: PageQueryParams & Record<string, unknown>,
): Promise<PageResponse<Category>> {
  const page = await api.categories.list({
    page: params.page,
    size: params.size,
    ...(params.sort ? { sort: params.sort } : {}),
  });
  return normalizePage(page as PageResponse<unknown>);
}

/** Lista completa para filtros (multi-select), sem paginação visível ao usuário. */
export async function fetchCategoriesListAll(): Promise<Category[]> {
  const page = await fetchCategoriesPage({
    page: 0,
    size: 1000,
    sort: "name,ASC",
  });
  return page.content ?? [];
}

export async function createCategory(request: CategoryCreateRequest): Promise<Category> {
  const raw = await api.categories.create(request);
  return normalizeCategoryFromApi(raw);
}

export async function updateCategory(
  id: string,
  request: CategoryUpdateRequest,
): Promise<Category> {
  const raw = await api.categories.update(id, request);
  return normalizeCategoryFromApi(raw);
}

export async function deleteCategory(id: string): Promise<void> {
  await api.categories.deleteById(id);
}

export async function fetchCategoryById(id: string): Promise<Category> {
  const raw = await api.categories.getById(id);
  return normalizeCategoryFromApi(raw);
}
