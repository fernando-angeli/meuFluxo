"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CardsModuleNav } from "@/components/credit-cards";
import { FilterSelect } from "@/components/filters/filter-select";
import { DateRangePicker, type DateRangeValue } from "@/components/filters/date-range-picker";
import { InvoicesTable, InvoiceDetailsPanel } from "@/components/invoices";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { DetailsDrawer } from "@/components/details";
import { SectionErrorState, SectionLoadingState } from "@/components/patterns";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InvoiceChargesModal } from "@/features/invoices/components/invoice-charges-modal";
import { InvoicePaymentModal } from "@/features/invoices/components/invoice-payment-modal";
import { InvoiceRowActions } from "@/features/invoices/components/invoice-row-actions";
import { getInvoicesTableColumns } from "@/features/invoices/invoices.columns";
import { fetchInvoicesPage } from "@/features/invoices/invoices.service";
import {
  creditCardsQueryKey,
  useAccounts,
  useCloseInvoice,
  useCreditCards,
  useDeleteInvoicePayment,
  useInvoiceDetails,
} from "@/hooks/api";
import { useAuthOptional } from "@/hooks/useAuth";
import { useTranslation } from "@/lib/i18n";
import { extractApiError } from "@/lib/api-error";
import { getQueryErrorMessage } from "@/lib/query-error";
import { useServerDataTable } from "@/hooks/useServerDataTable";
import { useToast } from "@/components/toast";
import type { Invoice, InvoicePaymentItem, InvoiceStatus } from "@meufluxo/types";

export default function InvoicesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const auth = useAuthOptional();
  const { success, error: showError } = useToast();
  const closeInvoiceMutation = useCloseInvoice();
  const deleteInvoicePaymentMutation = useDeleteInvoicePayment();
  const { data: creditCards = [] } = useCreditCards();
  const { data: accounts = [] } = useAccounts();

  const [filters, setFilters] = React.useState<{
    creditCardId: string;
    status: InvoiceStatus | "";
    dueDateRange: DateRangeValue | null;
  }>({
    creditCardId: searchParams.get("creditCardId") ?? "",
    status: (searchParams.get("status") as InvoiceStatus | null) ?? "",
    dueDateRange: null,
  });
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = React.useState<string | null>(null);
  const [selectedInvoicePreview, setSelectedInvoicePreview] = React.useState<Invoice | null>(null);
  const [closeConfirmOpen, setCloseConfirmOpen] = React.useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = React.useState(false);
  const [chargesModalOpen, setChargesModalOpen] = React.useState(false);
  const [deletePaymentConfirmOpen, setDeletePaymentConfirmOpen] = React.useState(false);
  const [paymentToDelete, setPaymentToDelete] = React.useState<InvoicePaymentItem | null>(null);

  React.useEffect(() => {
    const nextCreditCardId = searchParams.get("creditCardId") ?? "";
    const nextStatus = (searchParams.get("status") as InvoiceStatus | null) ?? "";
    setFilters((prev) => {
      if (prev.creditCardId === nextCreditCardId && prev.status === nextStatus) {
        return prev;
      }
      return {
        ...prev,
        creditCardId: nextCreditCardId,
        status: nextStatus,
      };
    });
  }, [searchParams]);

  const table = useServerDataTable<Invoice>({
    queryKey: ["invoices", ...creditCardsQueryKey],
    fetchPage: fetchInvoicesPage,
    initialPageSize: 10,
    initialSortKey: "dueDate",
    initialDirection: "desc",
    enabled: !auth?.isBootstrapping && !!auth?.isAuthenticated,
    extraQueryParams: {
      ...(filters.creditCardId ? { creditCardId: filters.creditCardId } : {}),
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.dueDateRange?.startDate ? { dueDateStart: filters.dueDateRange.startDate } : {}),
      ...(filters.dueDateRange?.endDate ? { dueDateEnd: filters.dueDateRange.endDate } : {}),
    },
  });

  const filterKey = React.useMemo(
    () =>
      JSON.stringify({
        creditCardId: filters.creditCardId,
        status: filters.status,
        dueDateRange: filters.dueDateRange,
      }),
    [filters],
  );

  React.useEffect(() => {
    table.onReset();
  }, [filterKey, table]);

  const pageResponse = table.pageResponseQuery.data ?? null;
  const rows = pageResponse?.content ?? [];
  const errorMessage = table.pageResponseQuery.isError
    ? getQueryErrorMessage(table.pageResponseQuery.error, "Não foi possível carregar as faturas.")
    : null;

  const detailsQuery = useInvoiceDetails(
    selectedInvoiceId,
    detailsOpen ||
      paymentModalOpen ||
      chargesModalOpen ||
      deletePaymentConfirmOpen,
  );
  const selectedInvoice = detailsQuery.data ?? selectedInvoicePreview;
  const detailsErrorMessage = detailsQuery.isError
    ? getQueryErrorMessage(detailsQuery.error, "Não foi possível carregar os detalhes da fatura.")
    : null;

  const refreshAll = React.useCallback(async () => {
    await table.pageResponseQuery.refetch();
    if (selectedInvoiceId) {
      await detailsQuery.refetch();
    }
  }, [detailsQuery, selectedInvoiceId, table.pageResponseQuery]);

  const handleViewDetails = React.useCallback(
    (invoice: Invoice) => {
      setSelectedInvoiceId(invoice.id);
      setSelectedInvoicePreview(invoice);
      setDetailsOpen(true);
    },
    [],
  );

  const handleCloseInvoice = React.useCallback(
    (invoice: Invoice) => {
      setSelectedInvoiceId(invoice.id);
      setSelectedInvoicePreview(invoice);
      setCloseConfirmOpen(true);
    },
    [],
  );

  const handlePayInvoice = React.useCallback(
    (invoice: Invoice) => {
      setSelectedInvoiceId(invoice.id);
      setSelectedInvoicePreview(invoice);
      setPaymentModalOpen(true);
    },
    [],
  );

  const renderActions = React.useCallback(
    (invoice: Invoice) => (
      <InvoiceRowActions
        invoice={invoice}
        onViewDetails={handleViewDetails}
        onCloseInvoice={handleCloseInvoice}
        onPayInvoice={handlePayInvoice}
      />
    ),
    [handleCloseInvoice, handlePayInvoice, handleViewDetails],
  );

  const columns = React.useMemo(
    () => getInvoicesTableColumns({ renderActions }),
    [renderActions],
  );

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title={t("pages.invoices.title")}
          description="Faturas de cartão com filtros, paginação e ordenação."
          right={<CardsModuleNav />}
        />

        <Card>
          <CardHeader className="pb-2">
            <div className="flex flex-col gap-3">
              <CardTitle className="text-base">Lista</CardTitle>
              <div className="grid gap-3 md:grid-cols-3">
                <FilterSelect
                  value={filters.creditCardId}
                  onChange={(value) =>
                    setFilters((prev) => ({
                      ...prev,
                      creditCardId: value,
                    }))
                  }
                  placeholder="Todos os cartões"
                  options={[
                    { value: "", label: "Todos os cartões" },
                    ...creditCards.map((card) => ({
                      value: card.id,
                      label: card.name,
                    })),
                  ]}
                />
                <FilterSelect<InvoiceStatus | "">
                  value={filters.status}
                  onChange={(value) =>
                    setFilters((prev) => ({
                      ...prev,
                      status: value,
                    }))
                  }
                  placeholder="Todos os status"
                  options={[
                    { value: "", label: "Todos os status" },
                    { value: "OPEN", label: "Aberta" },
                    { value: "CLOSED", label: "Fechada" },
                    { value: "PARTIALLY_PAID", label: "Parcial" },
                    { value: "PAID", label: "Quitada" },
                    { value: "OVERDUE", label: "Em atraso" },
                  ]}
                />
                <DateRangePicker
                  value={filters.dueDateRange}
                  onChange={(value) =>
                    setFilters((prev) => ({
                      ...prev,
                      dueDateRange: value,
                    }))
                  }
                  placeholder="Período de vencimento"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <InvoicesTable
              columns={columns}
              data={rows}
              loading={table.pageResponseQuery.isLoading}
              error={errorMessage}
              pageResponse={pageResponse}
              sortState={{
                sortKey: table.sortKey,
                direction: table.direction,
              }}
              onSortChange={table.onSortChange}
              onPageChange={table.onPageChange}
              onPageSizeChange={table.onPageSizeChange}
            />
          </CardContent>
        </Card>
      </div>

      <DetailsDrawer
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        title={selectedInvoice?.referenceLabel ?? "Detalhes da fatura"}
        description="Gestão operacional da fatura selecionada."
        widthClassName="w-full sm:max-w-5xl"
      >
        {detailsQuery.isLoading ? (
          <SectionLoadingState message="Carregando detalhes da fatura..." />
        ) : detailsErrorMessage ? (
          <SectionErrorState message={detailsErrorMessage} />
        ) : detailsQuery.data ? (
          <InvoiceDetailsPanel
            invoice={detailsQuery.data}
            closing={closeInvoiceMutation.isPending}
            onCloseInvoice={() => setCloseConfirmOpen(true)}
            onPayInvoice={() => setPaymentModalOpen(true)}
            onEditCharges={() => setChargesModalOpen(true)}
            onDeletePayment={(payment) => {
              setPaymentToDelete(payment);
              setDeletePaymentConfirmOpen(true);
            }}
            deletingPaymentId={
              deleteInvoicePaymentMutation.isPending ? (paymentToDelete?.id ?? null) : null
            }
            onEditExpenses={() => {
              router.push(`/card-expenses?invoiceId=${detailsQuery.data.id}`);
            }}
          />
        ) : (
          <SectionErrorState message="Nenhum detalhe disponível para esta fatura." />
        )}
      </DetailsDrawer>

      <ConfirmDialog
        open={closeConfirmOpen}
        onOpenChange={setCloseConfirmOpen}
        title="Fechar fatura"
        description="Confirma o fechamento desta fatura?"
        confirmText="Fechar fatura"
        isConfirming={closeInvoiceMutation.isPending}
        onConfirm={async () => {
          if (!selectedInvoiceId) return;
          try {
            await closeInvoiceMutation.mutateAsync(selectedInvoiceId);
            success("Fatura fechada com sucesso.");
            await refreshAll();
          } catch (err) {
            showError(getQueryErrorMessage(err, "Não foi possível fechar a fatura."));
          }
        }}
      />

      <InvoicePaymentModal
        open={paymentModalOpen}
        onOpenChange={setPaymentModalOpen}
        invoice={detailsQuery.data ?? null}
        accounts={accounts.map((account) => ({ id: account.id, name: account.name }))}
        onSaved={refreshAll}
      />

      <InvoiceChargesModal
        open={chargesModalOpen}
        onOpenChange={setChargesModalOpen}
        invoice={detailsQuery.data ?? null}
        onSaved={refreshAll}
      />

      <ConfirmDialog
        open={deletePaymentConfirmOpen}
        onOpenChange={(open) => {
          setDeletePaymentConfirmOpen(open);
          if (!open) setPaymentToDelete(null);
        }}
        title="Excluir pagamento"
        description="Confirma a exclusão deste pagamento? O saldo da conta será estornado e a fatura recalculada."
        confirmText="Excluir pagamento"
        confirmVariant="destructive"
        isConfirming={deleteInvoicePaymentMutation.isPending}
        onConfirm={async () => {
          if (!selectedInvoiceId || !paymentToDelete) return;
          try {
            await deleteInvoicePaymentMutation.mutateAsync({
              invoiceId: selectedInvoiceId,
              paymentId: paymentToDelete.id,
            });
            success("Pagamento excluído com sucesso.");
            setPaymentToDelete(null);
            await refreshAll();
          } catch (err) {
            const apiError = extractApiError(err);
            showError(apiError?.detail ?? "Não foi possível excluir o pagamento.");
          }
        }}
      />
    </>
  );
}
