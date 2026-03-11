import type { ScheduledMovement } from "@meufluxo/types";

import type { HttpClient } from "../http";

export type ScheduledMovementsApi = {
  list: (params?: { status?: string; accountId?: string }) => Promise<ScheduledMovement[]>;
  getById: (id: string) => Promise<ScheduledMovement>;
  create: (body: Omit<ScheduledMovement, "id" | "workspaceId" | "createdAt" | "updatedAt">) => Promise<ScheduledMovement>;
  update: (id: string, body: Partial<ScheduledMovement>) => Promise<ScheduledMovement>;
  delete: (id: string) => Promise<void>;
};

export function createScheduledMovementsApi(http: HttpClient): ScheduledMovementsApi {
  return {
    list: (params) =>
      http.request<ScheduledMovement[]>("/scheduled-movements", {
        method: "GET",
        query: params as Record<string, string>,
      }),
    getById: (id) =>
      http.request<ScheduledMovement>(`/scheduled-movements/${encodeURIComponent(id)}`, {
        method: "GET",
      }),
    create: (body) =>
      http.request<ScheduledMovement>("/scheduled-movements", { method: "POST", body }),
    update: (id, body) =>
      http.request<ScheduledMovement>(`/scheduled-movements/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body,
      }),
    delete: (id) =>
      http.request<void>(`/scheduled-movements/${encodeURIComponent(id)}`, { method: "DELETE" }),
  };
}
