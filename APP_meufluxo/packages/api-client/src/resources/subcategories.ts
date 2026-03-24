import type { SubCategory, PageQueryParams, PageResponse } from "@meufluxo/types";

import type { HttpClient } from "../http";

export type SubCategoriesListParams = Partial<Omit<PageQueryParams, "page" | "size">> & {
  page?: number;
  size?: number;
  sort?: string;
  /** Filtra subcategorias pela categoria pai (opcional). */
  categoryId?: string;
};

export type SubCategoryCreateRequest = {
  name: string;
  /** ID da categoria pai (numérico na API). */
  categoryId: number;
};

export type SubCategoryUpdateRequest = {
  name: string;
  categoryId?: number | null;
  active?: boolean | null;
};

export type SubCategoriesApi = {
  list: (params?: SubCategoriesListParams) => Promise<PageResponse<SubCategory>>;
  getById: (id: string) => Promise<SubCategory>;
  create: (request: SubCategoryCreateRequest) => Promise<SubCategory>;
  update: (id: string, request: SubCategoryUpdateRequest) => Promise<SubCategory>;
  deleteById: (id: string) => Promise<void>;
};

export function createSubCategoriesApi(http: HttpClient): SubCategoriesApi {
  const base = "/categories/sub-categories";

  return {
    list: (params) =>
      http.request<PageResponse<SubCategory>>(base, {
        method: "GET",
        query: {
          ...(params?.page !== undefined ? { page: params.page } : {}),
          ...(params?.size !== undefined ? { size: params.size } : {}),
          ...(params?.sort ? { sort: params.sort } : {}),
          ...(params?.categoryId != null &&
          String(params.categoryId).trim() !== "" &&
          !Number.isNaN(Number(params.categoryId))
            ? { categoryId: Number(params.categoryId) }
            : {}),
        } as Record<string, string | number | boolean | null | undefined>,
      }),
    getById: (id) =>
      http.request<SubCategory>(`${base}/${encodeURIComponent(id)}`, { method: "GET" }),
    create: (request) =>
      http.request<SubCategory>(base, {
        method: "POST",
        body: request,
      }),
    update: (id, request) =>
      http.request<SubCategory>(`${base}/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: request,
      }),
    deleteById: (id) =>
      http.request<void>(`${base}/${encodeURIComponent(id)}`, { method: "DELETE" }),
  };
}
