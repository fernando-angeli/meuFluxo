import { HttpClient, createMeuFluxoApi } from "@meufluxo/api-client";

import { env } from "@/lib/env";

export const http = new HttpClient({
  baseUrl: env.apiBaseUrl,
  getAuthToken: () => null,
});

export const api = createMeuFluxoApi(http);

