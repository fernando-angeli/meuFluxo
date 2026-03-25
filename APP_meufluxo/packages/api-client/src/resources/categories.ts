import type { Category, MovementType, PageQueryParams, PageResponse } from "@meufluxo/types";

import type { HttpClient } from "../http";

export type CategoriesListParams = Partial<Omit<PageQueryParams, "page" | "size">> & {
  page?: number;
  size?: number;
  sort?: string;
};

export type CategoryCreateRequest = {
  name: string;
  movementType: MovementType;
};

export type CategoryUpdateRequest = {
  name: string;
  active?: boolean | null;
};

export type CategoriesApi = {
  list: (params?: CategoriesListParams) => Promise<PageResponse<Category>>;
  getById: (id: string) => Promise<Category>;
  create: (request: CategoryCreateRequest) => Promise<Category>;
  update: (id: string, request: CategoryUpdateRequest) => Promise<Category>;
  deleteById: (id: string) => Promise<void>;
};

export function createCategoriesApi(http: HttpClient): CategoriesApi {
  return {
    list: (params) =>
      http.request<PageResponse<Category>>("/categories", {
        method: "GET",
        query: {
          ...(params?.page !== undefined ? { page: params.page } : {}),
          ...(params?.size !== undefined ? { size: params.size } : {}),
          ...(params?.sort ? { sort: params.sort } : {}),
        } as Record<string, string | number | boolean | null | undefined>,
      }),
    getById: (id) =>
      http.request<Category>(`/categories/${encodeURIComponent(id)}`, { method: "GET" }),
    create: (request) =>
      http.request<Category>("/categories", {
        method: "POST",
        body: request,
      }),
    update: (id, request) =>
      http.request<Category>(`/categories/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: request,
      }),
    deleteById: (id) =>
      http.request<void>(`/categories/${encodeURIComponent(id)}`, { method: "DELETE" }),
  };
}
