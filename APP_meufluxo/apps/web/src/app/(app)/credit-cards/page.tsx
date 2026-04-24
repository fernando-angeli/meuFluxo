"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import type { CreditCard } from "@meufluxo/types";

import { DataTable } from "@/components/data-table/DataTable";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { useToast } from "@/components/toast";
import { creditCardsQueryKey, useDeleteCreditCard } from "@/hooks/api";
import { useAuthOptional } from "@/hooks/useAuth";
import { useServerDataTable } from "@/hooks/useServerDataTable";
import { useTranslation } from "@/lib/i18n";
import { getQueryErrorMessage } from "@/lib/query-error";
import { extractApiError } from "@/lib/api-error";
import { toNumericIdString } from "@/lib/numeric-id";
import type { DataTableColumn } from "@/components/data-table/types";
import { fetchCreditCardsPage } from "@/features/credit-cards/credit-cards.service";
import { CreditCardFormModal } from "@/features/credit-cards/components/credit-card-form-modal";
import { CreditCardRowActions } from "@/features/credit-cards/components/credit-card-row-actions";

function formatDay(day: number | null | undefined): string {
  const numericDay = Number(day);
  if (!Number.isFinite(numericDay) || numericDay <= 0) return "—";
  return `Dia ${String(Math.trunc(numericDay)).padStart(2, "0")}`;
}

export default function CreditCardsPage() {
  const router = useRouter();
  const auth = useAuthOptional();
  const { t } = useTranslation();
  const { success, error } = useToast();

  const [cardFormOpen, setCardFormOpen] = React.useState(false);
  const [cardForForm, setCardForForm] = React.useState<CreditCard | null>(null);
  const [cardPendingDelete, setCardPendingDelete] = React.useState<CreditCard | null>(null);

  const deleteMutation = useDeleteCreditCard();

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

  const openManager = React.useCallback(
    (card: CreditCard) => {
      const numericCardId = toNumericIdString(card.id);
      if (!numericCardId) return;
      router.push(`/credit-cards/${encodeURIComponent(numericCardId)}`);
    },
    [router],
  );

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
        width: 176,
        render: (card) => (
          <CreditCardRowActions
            creditCard={card}
            onOpenManager={openManager}
            onEdit={(item) => {
              setCardForForm(item);
              setCardFormOpen(true);
            }}
            onDelete={(item) => setCardPendingDelete(item)}
            isDeleting={deleteMutation.isPending && cardPendingDelete?.id === card.id}
          />
        ),
      },
    ],
    [t, openManager, deleteMutation.isPending, cardPendingDelete?.id],
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
            <Button
              type="button"
              className="gap-2"
              onClick={() => {
                setCardForForm(null);
                setCardFormOpen(true);
              }}
            >
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
            onRowClick={(card) => openManager(card)}
            getRowKey={(card) => card.id}
            emptyTitle="Nenhum cartão encontrado"
            emptyDescription="Cadastre cartões para começar a gerir faturas e compras."
          />
        </CardContent>
      </Card>

      <CreditCardFormModal
        open={cardFormOpen}
        onOpenChange={(next) => {
          setCardFormOpen(next);
          if (!next) setCardForForm(null);
        }}
        creditCard={cardForForm}
      />

      <ConfirmDialog
        open={!!cardPendingDelete}
        onOpenChange={(open) => {
          if (!open) setCardPendingDelete(null);
        }}
        title="Excluir cartão"
        description={
          cardPendingDelete
            ? `Excluir permanentemente o cartão "${cardPendingDelete.name}"? A exclusão só é permitida se não houver lançamentos no cartão — a confirmação é feita pelo servidor.`
            : ""
        }
        cancelText="Cancelar"
        confirmText="Excluir"
        confirmVariant="destructive"
        isConfirming={deleteMutation.isPending}
        onConfirm={async () => {
          if (!cardPendingDelete) return;
          try {
            await deleteMutation.mutateAsync(cardPendingDelete.id);
            success("Cartão excluído com sucesso.");
            setCardPendingDelete(null);
          } catch (err) {
            const apiError = extractApiError(err);
            error(apiError?.detail ?? "Não foi possível excluir o cartão.");
          }
        }}
      />
    </div>
  );
}
