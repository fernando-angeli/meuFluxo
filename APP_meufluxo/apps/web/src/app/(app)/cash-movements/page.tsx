"use client";

import { Plus } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { SimpleTable } from "@/components/tables/simple-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockAccounts } from "@/features/accounts/mocks/accounts";
import { mockCashMovements } from "@/features/cash-movements/mocks/cash-movements";
import { formatCurrency } from "@meufluxo/utils";
import { useTranslation } from "@/lib/i18n";
import { useCategories } from "@/hooks/api";

export default function CashMovementsPage() {
  const { t } = useTranslation();
  const { data: categories = [] } = useCategories();
  const accountsById = new Map(mockAccounts.map((a) => [a.id, a]));
  const categoriesById = new Map(categories.map((c) => [c.id, c]));

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("pages.cashMovements.title")}
        description="Movimentações reais (confirmadas) do workspace."
        right={
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nova movimentação
          </Button>
        }
      />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleTable
            columns={[
              { key: "date", header: t("table.date") },
              { key: "description", header: t("table.description") },
              { key: "category", header: t("table.category") },
              { key: "account", header: t("table.account") },
              { key: "amount", header: t("table.amount"), className: "text-right" },
            ]}
            rows={mockCashMovements.map((m) => ({
              date: m.occurredAt,
              description: m.description ?? "—",
              category: m.categoryId ? categoriesById.get(m.categoryId)?.name ?? m.categoryId : "—",
              account: m.accountId ? accountsById.get(m.accountId)?.name ?? m.accountId : "—",
              amount: (
                <div className="text-right tabular-nums">
                  {formatCurrency(m.amount, m.currency)}
                </div>
              ),
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}

