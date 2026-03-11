"use client";

import { PageHeader } from "@/components/layout/page-header";
import { SimpleTable } from "@/components/tables/simple-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockCreditCards } from "@/features/credit-cards/mocks/credit-cards";
import { mockInvoices } from "@/features/invoices/mocks/invoices";
import { formatCurrency } from "@meufluxo/utils";
import { useTranslation } from "@/lib/i18n";

export default function InvoicesPage() {
  const { t } = useTranslation();
  const cardsById = new Map(mockCreditCards.map((c) => [c.id, c]));

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("pages.invoices.title")}
        description="Faturas de cartão (abertas, fechadas e pagas)."
      />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Lista</CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleTable
            columns={[
              { key: "month", header: t("table.month") },
              { key: "card", header: t("table.card") },
              { key: "status", header: t("table.status") },
              { key: "dueAt", header: t("table.dueAt") },
              { key: "total", header: t("table.total"), className: "text-right" },
            ]}
            rows={mockInvoices.map((i) => ({
              month: i.referenceMonth,
              card: cardsById.get(i.creditCardId)?.name ?? i.creditCardId,
              status: i.status,
              dueAt: i.dueAt,
              total: <div className="text-right tabular-nums">{formatCurrency(i.total, i.currency)}</div>,
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}

