"use client";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

import type { AccountDetails as AccountDetailsData } from "@meufluxo/types";
import { getAccountTypeLabel } from "@meufluxo/types";
import { formatCurrency } from "@meufluxo/utils";

import { DetailsRow, DetailsSection } from "@/components/details";
import { SectionEmptyState, SectionErrorState, SectionLoadingState } from "@/components/patterns";
import { AccountStatusBadge } from "@/features/accounts/components/account-status-badge";
import { CheckingAccountPanel } from "@/features/accounts/components/checking-account-panel";
import { normalizeBankString } from "@/features/accounts/lib/normalize-bank-fields";

function formatDateTime(value?: string | null) {
  if (!value) return "Não informado";
  try {
    return format(parseISO(value), "dd/MM/yyyy HH:mm", { locale: ptBR });
  } catch {
    return "Indisponível no momento";
  }
}

function fallbackText(value?: string | null, fallback = "Ainda não disponível") {
  return value?.trim() ? value : fallback;
}

export function AccountDetails({
  account,
  currency,
  loading = false,
  error = null,
}: {
  account: AccountDetailsData | null;
  currency: "BRL" | "USD" | "EUR";
  loading?: boolean;
  error?: string | null;
}) {
  if (loading) {
    return <SectionLoadingState message="Carregando detalhes da conta..." />;
  }

  if (error) {
    return <SectionErrorState message={error} />;
  }

  if (!account) {
    return <SectionEmptyState message="Selecione uma conta para visualizar os detalhes." />;
  }

  const bankCode = normalizeBankString(account.bankCode);
  const bankName = normalizeBankString(account.bankName);
  const agency = normalizeBankString(account.agency);
  const accountNumber = normalizeBankString(account.accountNumber);
  const showBankRows =
    account.accountType === "CHECKING" && !!(bankCode || bankName || agency || accountNumber);
  const bankDisplay =
    bankCode && bankName ? `[${bankCode}] ${bankName}` : bankCode ? `[${bankCode}]` : bankName || null;

  return (
    <div className="space-y-4">
      <DetailsSection title="Resumo" description="Informacoes principais da conta">
        <DetailsRow label="Nome" value={account.name} />
        <DetailsRow label="Tipo" value={getAccountTypeLabel(account.accountType)} />
        <DetailsRow label="Status" value={<AccountStatusBadge active={!!account.meta.active} />} />
        {showBankRows ? (
          <>
            {bankDisplay ? <DetailsRow label="Banco" value={bankDisplay} /> : null}
            {agency ? <DetailsRow label="Agência" value={agency} /> : null}
            {accountNumber ? <DetailsRow label="Conta" value={accountNumber} /> : null}
          </>
        ) : null}
        <DetailsRow
          label="Saldo inicial"
          value={
            account.initialBalance == null
              ? "Ainda não disponível"
              : formatCurrency(account.initialBalance, currency)
          }
        />
        <DetailsRow
          label="Saldo atual"
          value={formatCurrency(account.currentBalance, currency)}
          highlighted
        />
        <DetailsRow label="Saldo atualizado em" value={formatDateTime(account.balanceUpdatedAt)} />
      </DetailsSection>

      <CheckingAccountPanel account={account} currency={currency} />

      <DetailsSection title="Metadados" description="Rastreabilidade e auditoria">
        <DetailsRow label="Criado por" value={fallbackText(account.meta.createdByUserName, "Não informado")} />
        <DetailsRow label="Criado em" value={formatDateTime(account.meta.createdAt)} />
        <DetailsRow
          label="Atualizado por"
          value={fallbackText(account.meta.updatedByUserName, "Não informado")}
        />
        <DetailsRow label="Atualizado em" value={formatDateTime(account.meta.updatedAt)} />
      </DetailsSection>

      <DetailsSection title="Informacoes adicionais" description="Contexto operacional da conta">
        <DetailsRow
          label="Quantidade de lancamentos"
          value={
            account.movementCount == null ? "Ainda não disponível" : String(account.movementCount)
          }
        />
        <DetailsRow
          label="Proximos lancamentos programados"
          value={
            account.nextScheduledMovementsCount == null
              ? "Ainda não disponível"
              : String(account.nextScheduledMovementsCount)
          }
        />
      </DetailsSection>
    </div>
  );
}
