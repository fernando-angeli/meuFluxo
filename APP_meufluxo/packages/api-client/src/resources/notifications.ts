import type { Notification } from "@meufluxo/types";

import type { HttpClient } from "../http";

export type NotificationsApi = {
  list: (params?: { status?: string }) => Promise<Notification[]>;
  markAsRead: (id: string) => Promise<Notification>;
  markAllAsRead: () => Promise<void>;
};

export function createNotificationsApi(http: HttpClient): NotificationsApi {
  return {
    list: (params) =>
      http.request<Notification[]>("/notifications", {
        method: "GET",
        query: params as Record<string, string>,
      }),
    markAsRead: (id) =>
      http.request<Notification>(`/notifications/${encodeURIComponent(id)}/read`, {
        method: "PATCH",
      }),
    markAllAsRead: () =>
      http.request<void>("/notifications/read-all", { method: "PATCH" }),
  };
}
