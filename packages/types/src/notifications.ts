import type { ID } from "./index";

export type NotificationChannel = "IN_APP" | "EMAIL" | "WHATSAPP";
export type NotificationStatus = "UNREAD" | "READ" | "ARCHIVED";

export type Notification = {
  id: ID;
  workspaceId: ID;
  title: string;
  message: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  createdAt: string; // ISO
  readAt?: string; // ISO
};

