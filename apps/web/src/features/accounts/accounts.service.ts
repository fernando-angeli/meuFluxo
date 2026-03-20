"use client";

import { api } from "@/services/api";
import type { Account, PageResponse } from "@meufluxo/types";
import type { AccountsListParams } from "@meufluxo/api-client";

export async function fetchAccountsPage(
  params: AccountsListParams,
): Promise<PageResponse<Account>> {
  return api.accounts.list(params);
}

