"use client";

import { Plus } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/data-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SimpleTable } from "@/components/tables/simple-table";
import { mockAccounts } from "@/features/accounts/mocks/accounts";
import { formatCurrency } from "@meufluxo/utils";
import { useTranslation } from "@/lib/i18n";

export default function AccountsPage() {
  const { t } = useTranslation();
  const rows = mockAccounts.map((a) => ({
    name: a.name,
    type: a.type,
    balance: <div className="text-right tabular-nums">{formatCurrency(a.balance, a.currency)}</div>,
    status: a.isActive ? t("status.active") : t("status.inactive"),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("pages.accounts.title")}
        description="Contas financeiras do workspace (banco, carteira, caixa, investimento)."
        right={
          <Button className="gap-2" variant="default">
            <Plus className="h-4 w-4" />
            Nova conta
          </Button>
        }
      />

      <Card className="border-none bg-transparent shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Lista</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {rows.length === 0 ? (
            <EmptyState
              title={t("pages.accounts.noAccounts")}
              description="Comece criando suas contas bancárias, carteiras e investimentos para acompanhar seu fluxo."
              action={
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nova conta
                </Button>
              }
            />
          ) : (
            <SimpleTable
              columns={[
                { key: "name", header: t("table.name") },
                { key: "type", header: t("table.type") },
                { key: "balance", header: t("table.balance"), className: "text-right" },
                { key: "status", header: t("table.status") },
              ]}
              rows={rows}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

