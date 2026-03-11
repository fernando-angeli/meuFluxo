"use client";

import { useQuery } from "@tanstack/react-query";

import { api } from "@/services/api";
import { env } from "@/lib/env";
import { mockWorkspace } from "@/services/mocks/workspace";

export const workspaceQueryKey = ["workspace"] as const;

export function useWorkspace() {
  return useQuery({
    queryKey: workspaceQueryKey,
    queryFn: () => (env.useMocks ? Promise.resolve(mockWorkspace) : api.workspace.getCurrent()),
  });
}
