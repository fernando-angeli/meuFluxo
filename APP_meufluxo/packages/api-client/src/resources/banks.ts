import type { Bank, PageResponse } from "@meufluxo/types";

import type { HttpClient } from "../http";

function normalizeBank(raw: unknown): Bank {
  const r = raw as Record<string, unknown>;
  const code = r.code ?? r.bankCode ?? "";
  return {
    code: String(code),
    name: String(r.name ?? ""),
  };
}

function normalizeList(data: unknown): Bank[] {
  if (Array.isArray(data)) {
    return data.map(normalizeBank);
  }
  if (data && typeof data === "object" && "content" in data) {
    const page = data as PageResponse<unknown>;
    if (Array.isArray(page.content)) {
      return page.content.map(normalizeBank);
    }
  }
  return [];
}

export type BanksApi = {
  list: () => Promise<Bank[]>;
};

const BANKS_PATH = "/banks";

export function createBanksApi(http: HttpClient): BanksApi {
  return {
    list: async () => {
      const data = await http.request<unknown>(BANKS_PATH, { method: "GET" });
      return normalizeList(data);
    },
  };
}
