"use client";

import * as React from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { AccountDetails, AccountType } from "@meufluxo/types";
import { getAccountTypeLabel } from "@meufluxo/types";
import { formatCurrency } from "@meufluxo/utils";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { normalizeBankString } from "@/features/accounts/lib/normalize-bank-fields";

export type AccountHeroData = Pick<
  AccountDetails,
  | "name"
  | "accountType"
  | "currentBalance"
  | "meta"
  | "bankCode"
  | "bankName"
  | "agency"
  | "accountNumber"
  | "status"
  | "overdraftLimit"
  | "overdraftUsed"
  | "availableBalance"
  | "overdraftAvailable"
  | "overdraftUsagePercent"
  | "isUsingOverdraft"
  | "isLimitExceeded"
>;

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function formatMoney(value: unknown, currency: "BRL" | "USD" | "EUR"): string {
  if (!isFiniteNumber(value)) return "—";
  return formatCurrency(value, currency);
}

/** Badge visual por tipo — extensível quando novos tipos forem usados no backend. */
const ACCOUNT_TYPE_BADGE: Record<AccountType, string> = {
  CHECKING: "border-primary/35 bg-primary/8 text-foreground",
  SAVING: "border-sky-500/35 bg-sky-500/8 text-foreground",
  INVESTMENT: "border-violet-500/35 bg-violet-500/8 text-foreground",
  CASH: "border-emerald-600/30 bg-emerald-600/8 text-foreground",
  CREDIT_CARD: "border-amber-500/35 bg-amber-500/8 text-foreground",
  BENEFIT_CARD: "border-teal-500/35 bg-teal-500/8 text-foreground",
};

function bankMetadataLines(account: AccountHeroData): Array<{ key: string; label: string; value: string }> {
  const code = normalizeBankString(account.bankCode);
  const name = normalizeBankString(account.bankName);
  const agency = normalizeBankString(account.agency);
  const number = normalizeBankString(account.accountNumber);

  const lines: Array<{ key: string; label: string; value: string }> = [];
  if (code || name) {
    const bankValue = code && name ? `[${code}] ${name}` : code ? `[${code}]` : (name as string);
    lines.push({ key: "bank", label: "Banco", value: bankValue });
  }
  if (agency) lines.push({ key: "agency", label: "Agência", value: agency });
  if (number) lines.push({ key: "account", label: "Conta", value: number });
  return lines;
}

function clampPct(n: number) {
  return Math.min(100, Math.max(0, n));
}

function markerPositionStyle(pct: number, hasLimit: boolean): React.CSSProperties {
  if (!hasLimit) return { left: "0%", transform: "translate(0%, -50%)" };
  const p = clampPct(pct);
  if (p <= 0) return { left: "0%", transform: "translate(0%, -50%)" };
  if (p >= 100) return { left: "100%", transform: "translate(-100%, -50%)" };
  return { left: `${p}%`, transform: "translate(-50%, -50%)" };
}

function markerLabelPositionStyle(pct: number, hasLimit: boolean): React.CSSProperties {
  if (!hasLimit) return { left: "0%", transform: "translateX(0)" };
  const p = clampPct(pct);
  if (p <= 0) return { left: "0%", transform: "translateX(0)" };
  if (p >= 100) return { left: "100%", transform: "translateX(-100%)" };
  return { left: `${p}%`, transform: "translateX(-50%)" };
}

/**
 * Bloco visual de cheque especial (barra premium, limites, alertas).
 * Reutilizável na página da conta e em outros contextos.
 */
export function AccountChequeEspecialSection({
  account,
  currency,
}: {
  account: Pick<
    AccountDetails,
    | "currentBalance"
    | "overdraftLimit"
    | "overdraftUsed"
    | "availableBalance"
    | "overdraftAvailable"
    | "overdraftUsagePercent"
    | "isUsingOverdraft"
    | "isLimitExceeded"
  >;
  currency: "BRL" | "USD" | "EUR";
}) {
  const balance = isFiniteNumber(account.currentBalance) ? account.currentBalance : 0;
  const limit = account.overdraftLimit;
  const hasLimit = isFiniteNumber(limit) && limit > 0;
  const usedRaw = account.overdraftUsed;
  const hasUsed = isFiniteNumber(usedRaw);
  const used = hasUsed ? Math.max(0, usedRaw) : 0;

  const displayAvailable = isFiniteNumber(account.overdraftAvailable)
    ? account.overdraftAvailable
    : isFiniteNumber(account.availableBalance)
      ? account.availableBalance
      : hasLimit && hasUsed
        ? Math.max(0, limit - used)
        : null;

  const utilizationPct = hasLimit
    ? isFiniteNumber(account.overdraftUsagePercent)
      ? clampPct(account.overdraftUsagePercent)
      : clampPct((used / limit) * 100)
    : 0;

  const usingOverdraft =
    account.isUsingOverdraft === true
      ? true
      : account.isUsingOverdraft === false
        ? false
        : balance < 0;

  const limitExceeded =
    account.isLimitExceeded === true
      ? true
      : account.isLimitExceeded === false
        ? false
        : hasLimit && balance < -limit;

  const markerLeftPct = hasLimit ? utilizationPct : 0;
  const markerStyle = markerPositionStyle(markerLeftPct, hasLimit);
  const labelStyle = markerLabelPositionStyle(markerLeftPct, hasLimit);

  const usedLabel = !hasLimit && !hasUsed && !usingOverdraft ? "Sem uso" : formatMoney(hasUsed ? used : 0, currency);
  const availableLabel = displayAvailable != null ? formatMoney(displayAvailable, currency) : "—";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Cheque especial e disponibilidade
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Saldo da conta:{" "}
            <span className="font-semibold tabular-nums text-foreground">
              {formatCurrency(balance, currency)}
            </span>
          </p>
        </div>
        {hasLimit ? (
          <p className="text-xs text-muted-foreground">
            Limite total:{" "}
            <span className="font-medium tabular-nums text-foreground">{formatCurrency(limit, currency)}</span>
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">Limite não informado</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs text-muted-foreground">Em uso</p>
          <p className="text-lg font-semibold tabular-nums tracking-tight">{usedLabel}</p>
        </div>
        <div className="sm:text-right">
          <p className="text-xs text-muted-foreground">Disponível</p>
          <p className="text-lg font-semibold tabular-nums tracking-tight">{availableLabel}</p>
        </div>
      </div>

      <div className="relative pt-6 pb-1">
        <div
          className={cn(
            "relative h-3.5 w-full overflow-visible rounded-full ring-1 ring-border/60",
            markerLeftPct < 1 && !usingOverdraft
              ? "bg-emerald-500/20 dark:bg-emerald-950/50"
              : "bg-muted/80",
          )}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(markerLeftPct)}
          aria-label="Uso do limite de cheque especial"
        >
          <div
            className={cn(
              "absolute inset-y-0 left-0 rounded-full transition-[width] duration-700 ease-out",
              "bg-gradient-to-r from-emerald-500 via-amber-400 to-red-500",
              "dark:from-emerald-400 dark:via-amber-400 dark:to-red-500",
            )}
            style={{ width: `${hasLimit ? markerLeftPct : 0}%` }}
          />
          <div
            className={cn(
              "absolute top-1/2 z-10 h-4 w-4 rounded-full border-2 border-background",
              "bg-card shadow-md ring-2 ring-primary/40 transition-[left] duration-700 ease-out",
              limitExceeded && "ring-destructive/60",
              usingOverdraft && !limitExceeded && "ring-warning/50",
            )}
            style={markerStyle}
          />
        </div>
        {hasLimit ? (
          <div
            className="pointer-events-none absolute top-0 z-20 text-center transition-[left] duration-700 ease-out"
            style={labelStyle}
          >
            <span
              className={cn(
                "inline-block rounded-md border border-border/80 bg-card/95 px-2 py-0.5 text-[11px] font-medium tabular-nums shadow-sm backdrop-blur-sm",
                "text-foreground",
              )}
            >
              {Math.round(markerLeftPct)}%
            </span>
          </div>
        ) : null}
      </div>

      {limitExceeded ? (
        <div
          className={cn(
            "flex items-start gap-3 rounded-xl border px-3 py-2.5 text-sm",
            "border-destructive/55 bg-destructive/10 text-destructive-foreground dark:bg-destructive/15",
          )}
          role="alert"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="font-medium">Limite excedido</p>
            <p className="text-xs text-muted-foreground">
              {account.isLimitExceeded === true
                ? "O limite de cheque especial foi ultrapassado conforme os dados da conta."
                : "O saldo ultrapassou o limite de cheque especial configurado."}
            </p>
          </div>
          <Badge variant="destructive" className="shrink-0">
            Crítico
          </Badge>
        </div>
      ) : usingOverdraft ? (
        <div
          className={cn(
            "flex items-start gap-3 rounded-xl border px-3 py-2.5 text-sm",
            "border-warning/50 bg-warning/15 text-warning-foreground",
          )}
          role="alert"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="font-medium">Usando cheque especial</p>
            <p className="text-xs text-muted-foreground">
              {account.isUsingOverdraft === true
                ? "Há uso do limite de cheque especial conforme os dados da conta."
                : "O saldo atual está negativo."}
            </p>
          </div>
          <Badge variant="warning" className="shrink-0">
            Atenção
          </Badge>
        </div>
      ) : (
        <div
          className={cn(
            "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm",
            "border-emerald-600/25 bg-emerald-500/10 text-foreground dark:border-success/30 dark:bg-success/15",
          )}
        >
          <CheckCircle2
            className="h-4 w-4 shrink-0 text-emerald-600 dark:text-success-foreground"
            aria-hidden
          />
          <p className="text-sm">Saldo dentro do disponível</p>
        </div>
      )}
    </div>
  );
}

function NonCheckingBalanceFooter({
  account,
  currency,
}: {
  account: Pick<AccountDetails, "currentBalance">;
  currency: "BRL" | "USD" | "EUR";
}) {
  const balance = isFiniteNumber(account.currentBalance) ? account.currentBalance : 0;
  return (
    <div className="rounded-xl border border-border/60 bg-muted/30 px-4 py-3 dark:bg-muted/15">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Saldo atual</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">{formatCurrency(balance, currency)}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Limite de cheque especial não se aplica a este tipo de conta.
      </p>
    </div>
  );
}

/**
 * Card principal do topo da visão da conta: identidade + metadados bancários + cheque especial.
 */
export function AccountHeroCard({
  account,
  currency,
}: {
  account: AccountHeroData;
  currency: "BRL" | "USD" | "EUR";
}) {
  const bankLines = bankMetadataLines(account);
  const typeClass = ACCOUNT_TYPE_BADGE[account.accountType] ?? ACCOUNT_TYPE_BADGE.CHECKING;

  return (
    <Card className="overflow-hidden border-border/80 shadow-sm">
      <CardContent className="p-0">
        <div className="space-y-4 p-5 sm:p-6">
          <div className="min-w-0 space-y-3">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{account.name}</h2>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={cn("rounded-lg font-normal", typeClass)}>
                {getAccountTypeLabel(account.accountType)}
              </Badge>
              <Badge variant={account.meta.active ? "success" : "muted"} className="rounded-lg font-normal">
                {account.meta.active ? "Ativa" : "Inativa"}
              </Badge>
              {normalizeBankString(account.status) ? (
                <Badge variant="outline" className="rounded-lg font-normal text-muted-foreground">
                  {normalizeBankString(account.status)}
                </Badge>
              ) : null}
            </div>
          </div>

          {bankLines.length > 0 ? (
            <div
              className={cn(
                "rounded-xl border border-border/50 bg-muted/30 px-3 py-2.5 dark:bg-muted/20",
                "flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-1",
              )}
            >
              {bankLines.map((row) => (
                <div key={row.key} className="text-sm">
                  <span className="text-muted-foreground">{row.label}: </span>
                  <span className="font-medium text-foreground">{row.value}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <Separator />

        <div className="p-5 sm:p-6">
          {account.accountType === "CHECKING" ? (
            <AccountChequeEspecialSection account={account} currency={currency} />
          ) : (
            <NonCheckingBalanceFooter account={account} currency={currency} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
