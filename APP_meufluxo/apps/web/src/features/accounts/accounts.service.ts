"use client";

import { api } from "@/services/api";
import type { Account, AccountDetails, AccountId, PageResponse } from "@meufluxo/types";
import type { AccountsListParams } from "@meufluxo/api-client";

export async function fetchAccountsPage(
  params: AccountsListParams,
): Promise<PageResponse<Account>> {
  return api.accounts.list(params);
}

export async function fetchAccountById(id: AccountId): Promise<AccountDetails> {
  return api.accounts.getById(id);
}

