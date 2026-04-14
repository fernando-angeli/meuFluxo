"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Plus } from "lucide-react";
import type { CreditCard } from "@meufluxo/types";

import { DataTable } from "@/components/data-table/DataTable";
import { PageHeader } from "@/components/layout/page-header";
import { RowActionButtons } from "@/components/patterns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { creditCardsQueryKey } from "@/hooks/api";
import { useAuthOptional } from "@/hooks/useAuth";
import { useServerDataTable } from "@/hooks/useServerDataTable";
import { useTranslation } from "@/lib/i18n";
import { getQueryErrorMessage } from "@/lib/query-error";
import { toNumericIdString } from "@/lib/numeric-id";
import type { DataTableColumn } from "@/components/data-table/types";
import { fetchCreditCardsPage } from "@/features/credit-cards/credit-cards.service";

function formatDay(day: number | null | undefined): string {
  const numericDay = Number(day);
  if (!Number.isFinite(numericDay) || numericDay <= 0) return "—";
  return `Dia ${String(Math.trunc(numericDay)).padStart(2, "0")}`;
}

export default function CreditCardsPage() {
  const router = useRouter();
  const auth = useAuthOptional();
  const { t } = useTranslation();

  const cardsTable = useServerDataTable<CreditCard>({
    queryKey: creditCardsQueryKey,
    fetchPage: fetchCreditCardsPage,
    initialPageSize: 10,
    initialSortKey: "name",
    initialDirection: "asc",
    enabled: !auth?.isBootstrapping && !!auth?.isAuthenticated,
  });

  const pageResponse = cardsTable.pageResponseQuery.data ?? null;
  const creditCards = pageResponse?.content ?? [];
  const errorMessage = cardsTable.pageResponseQuery.isError
    ? getQueryErrorMessage(cardsTable.pageResponseQuery.error, "Não foi possível carregar os cartões.")
    : null;

  const columns = React.useMemo<Array<DataTableColumn<CreditCard>>>(
    () => [
      {
        key: "name",
        title: t("table.name"),
        dataIndex: "name",
        sortable: true,
        sortKey: "name",
        cellClassName: "font-medium",
      },
      {
        key: "brandCard",
        title: "Bandeira",
        sortable: true,
        sortKey: "brandCard",
        render: (card) => card.brandCard ?? "—",
      },
      {
        key: "closingDay",
        title: "Fechamento",
        sortable: true,
        sortKey: "closingDay",
        render: (card) => formatDay(card.closingDay),
      },
      {
        key: "dueDay",
        title: "Vencimento",
        sortable: true,
        sortKey: "dueDay",
        render: (card) => formatDay(card.dueDay),
      },
      {
        key: "status",
        title: t("table.status"),
        sortable: true,
        sortKey: "status",
        render: (card) => (
          <Badge
            variant={card.meta.active ? "success" : "muted"}
            className="inline-flex items-center gap-1.5 rounded-lg font-normal"
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                card.meta.active ? "bg-success-foreground" : "bg-muted-foreground"
              }`}
            />
            {card.meta.active ? t("status.active") : t("status.inactive")}
          </Badge>
        ),
      },
      {
        key: "actions",
        title: "Ações",
        align: "right",
        width: 148,
        render: (card) => (
          <RowActionButtons
            actions={[
              {
                key: "open-manager",
                label: "Abrir visão gerencial do cartão",
                icon: LayoutDashboard,
                ariaLabel: "Abrir visão gerencial do cartão",
                iconClassName: "text-sky-600 dark:text-sky-400",
                buttonClassName: "hover:bg-sky-500/10",
                onClick: () => {
                  const numericCardId = toNumericIdString(card.id);
                  if (!numericCardId) return;
                  router.push(`/credit-cards/${encodeURIComponent(numericCardId)}`);
                },
              },
            ]}
          />
        ),
      },
    ],
    [router, t],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("pages.creditCards.title")}
        description="Selecione um cartão para abrir a visão gerencial com dados e ações contextualizadas."
      />

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-base">Lista</CardTitle>
            <Button className="gap-2" disabled>
              <Plus className="h-4 w-4" />
              Novo cartão
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={creditCards}
            loading={cardsTable.pageResponseQuery.isLoading}
            error={errorMessage}
            pageResponse={pageResponse}
            sortState={{ sortKey: cardsTable.sortKey, direction: cardsTable.direction }}
            onSortChange={cardsTable.onSortChange}
            onPageChange={cardsTable.onPageChange}
            onPageSizeChange={cardsTable.onPageSizeChange}
            onRowClick={(card) => {
              const numericCardId = toNumericIdString(card.id);
              if (!numericCardId) return;
              router.push(`/credit-cards/${encodeURIComponent(numericCardId)}`);
            }}
            getRowKey={(card) => card.id}
            emptyTitle="Nenhum cartão encontrado"
            emptyDescription="Cadastre cartões para começar a gerir faturas e compras."
          />
        </CardContent>
      </Card>
    </div>
  );
}
