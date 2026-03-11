import type { Workspace, WorkspaceUser } from "@meufluxo/types";

import type { HttpClient } from "../http";

export type WorkspaceApi = {
  getCurrent: () => Promise<Workspace>;
  listUsers: () => Promise<WorkspaceUser[]>;
};

export function createWorkspaceApi(http: HttpClient): WorkspaceApi {
  return {
    getCurrent: () => http.request<Workspace>("/workspace", { method: "GET" }),
    listUsers: () => http.request<WorkspaceUser[]>("/workspace/users", { method: "GET" }),
  };
}
