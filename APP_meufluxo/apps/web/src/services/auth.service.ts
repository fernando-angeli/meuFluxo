import type { RefreshResponse } from "@meufluxo/types";

import { env } from "@/lib/env";

/**
 * Chama POST /auth/refresh com credentials para enviar o cookie httpOnly.
 * Usado no bootstrap e no retry após 401.
 */
const REFRESH_TIMEOUT_MS = 12_000;

/**
 * Nunca lança: falha de rede, timeout ou corpo inválido → null.
 * Evita bootstrap da sessão preso e rejeições não tratadas na tela de login.
 */
export async function refreshWithCredentials(): Promise<RefreshResponse | null> {
  try {
    const url = `${env.apiBaseUrl.replace(/\/+$/, "")}/auth/refresh`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REFRESH_TIMEOUT_MS);

    const res = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) return null;

    const data = await res.json().catch(() => null);
    if (!data?.accessToken) return null;

    return data as RefreshResponse;
  } catch {
    return null;
  }
}
