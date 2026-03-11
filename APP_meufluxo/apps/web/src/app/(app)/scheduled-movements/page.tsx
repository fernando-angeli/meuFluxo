"use client";

import { Plus } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { SimpleTable } from "@/components/tables/simple-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockAccounts } from "@/features/accounts/mocks/accounts";
import { mockScheduledMovements } from "@/features/scheduled-movements/mocks/scheduled-movements";
import { formatCurrency } from "@meufluxo/utils";
import { useTranslation } from "@/lib/i18n";

export default function ScheduledMovementsPage() {
  const { t } = useTranslation();
  const accountsById = new Map(mockAccounts.map((a) => [a.id, a]));

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("pages.scheduled.title")}
        description="Agendamentos e projeções futuras (pendências)."
        right={
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo agendamento
          </Button>
        }
      />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Próximos</CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleTable
            columns={[
              { key: "dueAt", header: t("table.dueAt") },
              { key: "title", header: t("table.title") },
              { key: "status", header: t("table.status") },
              { key: "account", header: t("table.account") },
              { key: "amount", header: t("table.amount"), className: "text-right" },
            ]}
            rows={mockScheduledMovements.map((s) => ({
              dueAt: s.dueAt,
              title: s.title,
              status: s.status,
              account: s.accountId ? accountsById.get(s.accountId)?.name ?? s.accountId : "—",
              amount: (
                <div className="text-right tabular-nums">{formatCurrency(s.amount, s.currency)}</div>
              ),
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}

