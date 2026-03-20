import { HttpClient, createMeuFluxoApi } from "@meufluxo/api-client";

import { getAuthToken, on401RetryRef, onUnauthorizedRef } from "@/lib/auth-token";
import { env } from "@/lib/env";

export const http = new HttpClient({
  baseUrl: env.apiBaseUrl,
  getAuthToken,
  on401Retry: () =>
    on401RetryRef.current ? on401RetryRef.current() : Promise.resolve(null),
  onUnauthorized: () => onUnauthorizedRef.current?.(),
});

export const api = createMeuFluxoApi(http);

