"use client";

import type { SubCategory, PageQueryParams, PageResponse } from "@meufluxo/types";

import { api } from "@/services/api";
import type {
  SubCategoryCreateRequest,
  SubCategoryUpdateRequest,
} from "@meufluxo/api-client";

export function normalizeSubCategoryFromApi(raw: unknown): SubCategory {
  const r = raw as Record<string, unknown>;
  const meta = r.meta as Record<string, unknown> | undefined;
  const catRaw = r.category as Record<string, unknown> | undefined;
  const movementType = (r.movementType ??
    catRaw?.types ??
    catRaw?.movementType) as SubCategory["movementType"];
  const catMovement = (catRaw?.types ?? catRaw?.movementType ?? movementType) as SubCategory["movementType"];

  return {
    id: String(r.id ?? ""),
    name: String(r.name ?? ""),
    movementType,
    category: {
      id: String(catRaw?.id ?? ""),
      name: String(catRaw?.name ?? ""),
      movementType: catMovement,
    },
    meta: {
      createdAt: String(meta?.createdAt ?? ""),
      updatedAt: String(meta?.updatedAt ?? ""),
      active: Boolean(meta?.active),
    },
    description:
      r.description != null && String(r.description).trim() !== ""
        ? String(r.description)
        : null,
  };
}

function normalizePage(page: PageResponse<unknown>): PageResponse<SubCategory> {
  return {
    ...page,
    content: (page.content ?? []).map((item) => normalizeSubCategoryFromApi(item)),
  };
}

export async function fetchSubcategoriesPageForCategory(
  categoryId: string,
  params: PageQueryParams,
): Promise<PageResponse<SubCategory>> {
  const page = await api.subCategories.list({
    categoryId,
    page: params.page,
    size: params.size,
    ...(params.sort ? { sort: params.sort } : {}),
  });
  return normalizePage(page as PageResponse<unknown>);
}

/** Lista completa para filtros do dashboard (sem filtro de categoria). */
export async function fetchSubcategoriesListAll(): Promise<SubCategory[]> {
  const page = await api.subCategories.list({
    page: 0,
    size: 2000,
    sort: "name,ASC",
  });
  const normalized = normalizePage(page as PageResponse<unknown>);
  return normalized.content ?? [];
}

export async function createSubcategory(
  request: SubCategoryCreateRequest,
): Promise<SubCategory> {
  const raw = await api.subCategories.create(request);
  return normalizeSubCategoryFromApi(raw);
}

export async function updateSubcategory(
  id: string,
  request: SubCategoryUpdateRequest,
): Promise<SubCategory> {
  const raw = await api.subCategories.update(id, request);
  return normalizeSubCategoryFromApi(raw);
}

export async function deleteSubcategory(id: string): Promise<void> {
  await api.subCategories.deleteById(id);
}
