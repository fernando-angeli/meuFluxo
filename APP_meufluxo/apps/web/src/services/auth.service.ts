import type { RefreshResponse } from "@meufluxo/types";

import { env } from "@/lib/env";

/**
 * Chama POST /auth/refresh com credentials para enviar o cookie httpOnly.
 * Usado no bootstrap e no retry após 401.
 */
export async function refreshWithCredentials(): Promise<RefreshResponse | null> {
  const url = `${env.apiBaseUrl.replace(/\/+$/, "")}/auth/refresh`;
  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) return null;

  const data = await res.json().catch(() => null);
  if (!data?.accessToken) return null;

  return data as RefreshResponse;
}
