"use client";

import type { AccountDetails } from "@meufluxo/types";

import { AccountChequeEspecialSection } from "./account-hero-card";

type CheckingSlice = Pick<
  AccountDetails,
  | "accountType"
  | "currentBalance"
  | "overdraftLimit"
  | "overdraftUsed"
  | "availableBalance"
>;

/** Conteúdo de cheque especial para contextos fora do card principal (ex.: drawer de detalhes). */
export function CheckingAccountPanel({
  account,
  currency,
}: {
  account: CheckingSlice;
  currency: "BRL" | "USD" | "EUR";
}) {
  if (account.accountType !== "CHECKING") return null;
  const overdraftLimit = Number(account.overdraftLimit ?? 0);
  if (!Number.isFinite(overdraftLimit) || overdraftLimit <= 0) return null;

  return (
    <div className="rounded-xl border border-border/80 bg-card/50 p-4 dark:bg-card/30">
      <AccountChequeEspecialSection account={account} currency={currency} />
    </div>
  );
}
