"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FilterSelect } from "@/components/filters";
import { CreditCardsTable } from "@/components/credit-cards";
import { useAuthOptional } from "@/hooks/useAuth";
import { useUpdateCreditCardActive, creditCardsQueryKey } from "@/hooks/api";
import { useTranslation } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { extractApiError } from "@/lib/api-error";
import { getQueryErrorMessage } from "@/lib/query-error";
import type { CreditCard } from "@meufluxo/types";
import { useServerDataTable } from "@/hooks/useServerDataTable";
import { fetchCreditCardsPage } from "@/features/credit-cards/credit-cards.service";
import { getCreditCardsTableColumns } from "@/features/credit-cards/credit-cards.columns";
import { CreditCardFormModal } from "@/features/credit-cards/components/credit-card-form-modal";
import { CreditCardRowActions } from "@/features/credit-cards/components/credit-card-row-actions";

type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE";

export default function CreditCardsPage() {
  const { t } = useTranslation();
  const auth = useAuthOptional();
  const { success, error } = useToast();
  const updateActiveMutation = useUpdateCreditCardActive();

  const currency = (auth?.preferences?.currency as "BRL" | "USD" | "EUR") ?? "BRL";

  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingCreditCard, setEditingCreditCard] = React.useState<CreditCard | null>(null);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("ALL");
  const normalizedSearch = search.trim().toLowerCase();

  const creditCardsTable = useServerDataTable<CreditCard>({
    queryKey: creditCardsQueryKey,
    fetchPage: fetchCreditCardsPage,
    initialPageSize: 10,
    initialSortKey: "name",
    initialDirection: "asc",
    enabled: !auth?.isBootstrapping && !!auth?.isAuthenticated,
    extraQueryParams: {
      ...(statusFilter === "ACTIVE" ? { active: true } : {}),
      ...(statusFilter === "INACTIVE" ? { active: false } : {}),
    },
  });

  React.useEffect(() => {
    creditCardsTable.onReset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizedSearch, statusFilter]);

  const pageResponse = creditCardsTable.pageResponseQuery.data ?? null;
  const creditCards = pageResponse?.content ?? [];

  const filteredCreditCards = React.useMemo(() => {
    if (!normalizedSearch) return creditCards;
    return creditCards.filter((card) =>
      card.name.toLowerCase().includes(normalizedSearch),
    );
  }, [creditCards, normalizedSearch]);

  const errorMessage = creditCardsTable.pageResponseQuery.isError
    ? getQueryErrorMessage(
        creditCardsTable.pageResponseQuery.error,
        "Não foi possível carregar os cartões.",
      )
    : null;

  const openCreateModal = React.useCallback(() => {
    setEditingCreditCard(null);
    setModalOpen(true);
  }, []);

  const openEditModal = React.useCallback((card: CreditCard) => {
    setEditingCreditCard(card);
    setModalOpen(true);
  }, []);

  const handleToggleActive = React.useCallback(
    async (card: CreditCard) => {
      try {
        const nextActive = !card.meta.active;
        await updateActiveMutation.mutateAsync({
          id: card.id,
          request: { active: nextActive },
        });
        success(
          nextActive
            ? "Cartão ativado com sucesso"
            : "Cartão inativado com sucesso",
        );
      } catch (err) {
        const apiError = extractApiError(err);
        error(apiError?.detail ?? "Não foi possível atualizar o status do cartão");
      }
    },
    [error, success, updateActiveMutation],
  );

  const renderActions = React.useCallback(
    (card: CreditCard) => (
      <CreditCardRowActions
        creditCard={card}
        onEdit={openEditModal}
        onToggleActive={handleToggleActive}
        isToggling={updateActiveMutation.isPending}
      />
    ),
    [handleToggleActive, openEditModal, updateActiveMutation.isPending],
  );

  const columns = React.useMemo(
    () => getCreditCardsTableColumns({ currency, renderActions }),
    [currency, renderActions],
  );

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title={t("pages.creditCards.title")}
          description="Gerencie cartões de crédito, ciclos de fatura e conta padrão para pagamento."
          right={
            <Button className="gap-2" onClick={openCreateModal}>
              <Plus className="h-4 w-4" />
              Novo cartão
            </Button>
          }
        />

        <Card className="border-none bg-transparent shadow-none">
          <CardHeader className="pb-2">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <CardTitle className="text-base">Lista</CardTitle>
              <div className="grid w-full gap-2 md:max-w-2xl md:grid-cols-[minmax(0,1fr)_220px]">
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar por nome..."
                />
                <FilterSelect<StatusFilter>
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[
                    { value: "ALL", label: "Todos os status" },
                    { value: "ACTIVE", label: "Ativos" },
                    { value: "INACTIVE", label: "Inativos" },
                  ]}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <CreditCardsTable
              columns={columns}
              data={filteredCreditCards}
              loading={creditCardsTable.pageResponseQuery.isLoading}
              error={errorMessage}
              pageResponse={pageResponse}
              sortState={{
                sortKey: creditCardsTable.sortKey,
                direction: creditCardsTable.direction,
              }}
              onSortChange={creditCardsTable.onSortChange}
              onPageChange={creditCardsTable.onPageChange}
              onPageSizeChange={creditCardsTable.onPageSizeChange}
              onRowClick={openEditModal}
            />
          </CardContent>
        </Card>
      </div>

      <CreditCardFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        creditCard={editingCreditCard}
      />
    </>
  );
}
