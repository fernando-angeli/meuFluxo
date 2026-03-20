"use client";

import { Plus } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { SimpleTable } from "@/components/tables/simple-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreditCards } from "@/hooks/api";
import { useTranslation } from "@/lib/i18n";

export default function CreditCardsPage() {
  const { t } = useTranslation();
  const { data: creditCards = [] } = useCreditCards();

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("pages.creditCards.title")}
        description="Cartões de crédito do workspace (faturas, limites e ciclos)."
        right={
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo cartão
          </Button>
        }
      />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Lista</CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleTable
            columns={[
              { key: "name", header: t("table.name") },
              { key: "brand", header: "Bandeira" },
              { key: "cycle", header: "Ciclo" },
              { key: "status", header: t("table.status") },
            ]}
            rows={creditCards.map((creditCard) => ({
              name: creditCard.name,
              brand: creditCard.brandCard ?? "—",
              cycle: `Fecha dia ${creditCard.closingDay} • Vence dia ${creditCard.dueDay}`,
              status: creditCard.meta.active ? t("status.active") : t("status.inactive"),
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
