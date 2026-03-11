import type { ID } from "./index";

export type Workspace = {
  id: ID;
  name: string;
  currency: "BRL" | "USD" | "EUR";
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

export type WorkspaceUserRole = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";

export type WorkspaceUser = {
  id: ID;
  workspaceId: ID;
  userId: ID;
  role: WorkspaceUserRole;
  invitedAt?: string; // ISO
  joinedAt?: string; // ISO
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

