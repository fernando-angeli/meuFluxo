import type { Workspace, WorkspaceUser } from "@meufluxo/types";

export const mockWorkspace: Workspace = {
  id: "ws_1",
  name: "Família",
  currency: "BRL",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const mockWorkspaceUsers: WorkspaceUser[] = [
  {
    id: "wsu_1",
    workspaceId: "ws_1",
    userId: "usr_1",
    role: "OWNER",
    joinedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

