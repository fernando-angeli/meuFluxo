import type { Category, MovementType } from "@meufluxo/types";

import type { HttpClient } from "../http";

export type CategoriesApi = {
  list: (params?: { movementType?: MovementType }) => Promise<Category[]>;
  getById: (id: string) => Promise<Category>;
};

export function createCategoriesApi(http: HttpClient): CategoriesApi {
  return {
    list: (params) =>
      http.request<Category[]>("/categories", {
        method: "GET",
        query: params,
      }),
    getById: (id) => http.request<Category>(`/categories/${encodeURIComponent(id)}`, { method: "GET" }),
  };
}
