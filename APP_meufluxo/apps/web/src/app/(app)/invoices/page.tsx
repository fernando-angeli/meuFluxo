"use client";

import * as React from "react";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DateRangePicker, FilterSelect } from "@/components/filters";
import { DetailsDrawer } from "@/components/details";
import { InvoiceDetails, InvoicesTable } from "@/components/invoices";
import {
  invoicesQueryKey,
  useCreditCards,
  useInvoiceDetails,
} from "@/hooks/api";
import { useAuthOptional } from "@/hooks/useAuth";
import { useServerDataTable } from "@/hooks/useServerDataTable";
import { useTranslation } from "@/lib/i18n";
import { getQueryErrorMessage } from "@/lib/query-error";
import { useToast } from "@/components/toast";
import type { CreditCardInvoiceListItem } from "@meufluxo/types";

import { getInvoicesTableColumns } from "@/features/invoices/invoices.columns";
import { fetchInvoicesPage } from "@/features/invoices/invoices.service";
import { InvoicePaymentModal } from "@/features/invoices/components/invoice-payment-modal";
import { InvoiceRowActions } from "@/features/invoices/components/invoice-row-actions";

type InvoiceStatusFilter =
  | ""
  | "OPEN"
  | "CLOSED"
  | "PARTIALLY_PAID"
  | "PAID"
  | "OVERDUE";

export default function InvoicesPage() {
  const { t } = useTranslation();
  const auth = useAuthOptional();
  const { error: toastError } = useToast();
  const { data: creditCards = [] } = useCreditCards();

  const currency = (auth?.preferences?.currency as "BRL" | "USD" | "EUR") ?? "BRL";

  const [search, setSearch] = React.useState("");
  const [creditCardId, setCreditCardId] = React.useState<string>("");
  const [status, setStatus] = React.useState<InvoiceStatusFilter>("");
  const [dueDateRange, setDueDateRange] = React.useState<{
    startDate: string;
    endDate: string;
  } | null>(null);

  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = React.useState<string | null>(null);
  const [selectedInvoicePreview, setSelectedInvoicePreview] =
    React.useState<CreditCardInvoiceListItem | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = React.useState(false);
  const [invoiceForPayment, setInvoiceForPayment] = React.useState<CreditCardInvoiceListItem | null>(
    null,
  );

  const normalizedSearch = search.trim().toLowerCase();

  const invoicesTable = useServerDataTable<CreditCardInvoiceListItem>({
    queryKey: invoicesQueryKey,
    fetchPage: fetchInvoicesPage,
    initialPageSize: 10,
    initialSortKey: "dueDate",
    initialDirection: "desc",
    enabled: !auth?.isBootstrapping && !!auth?.isAuthenticated,
    extraQueryParams: {
      ...(creditCardId ? { creditCardId } : {}),
      ...(status ? { status } : {}),
      ...(dueDateRange?.startDate ? { dueDateStart: dueDateRange.startDate } : {}),
      ...(dueDateRange?.endDate ? { dueDateEnd: dueDateRange.endDate } : {}),
    },
  });

  const invoiceDetailsQuery = useInvoiceDetails(selectedInvoiceId, detailsOpen);

  React.useEffect(() => {
    invoicesTable.onReset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizedSearch, creditCardId, status, dueDateRange?.startDate, dueDateRange?.endDate]);

  const pageResponse = invoicesTable.pageResponseQuery.data ?? null;
  const invoices = pageResponse?.content ?? [];
  const filteredInvoices = React.useMemo(() => {
    if (!normalizedSearch) return invoices;
    return invoices.filter((invoice) => {
      const card = invoice.creditCardName.toLowerCase();
      const reference = invoice.referenceLabel.toLowerCase();
      return card.includes(normalizedSearch) || reference.includes(normalizedSearch);
    });
  }, [invoices, normalizedSearch]);

  const listErrorMessage = invoicesTable.pageResponseQuery.isError
    ? getQueryErrorMessage(
        invoicesTable.pageResponseQuery.error,
        "Não foi possível carregar as faturas.",
      )
    : null;
  const detailsErrorMessage = invoiceDetailsQuery.isError
    ? getQueryErrorMessage(
        invoiceDetailsQuery.error,
        "Não foi possível carregar os detalhes da fatura.",
      )
    : null;

  const openDetails = React.useCallback((invoice: CreditCardInvoiceListItem) => {
    setSelectedInvoiceId(invoice.id);
    setSelectedInvoicePreview(invoice);
    setDetailsOpen(true);
  }, []);

  const openPaymentModal = React.useCallback((invoice: CreditCardInvoiceListItem) => {
    setInvoiceForPayment(invoice);
    setPaymentModalOpen(true);
  }, []);

  const unavailableAction = React.useCallback((label: string) => {
    toastError(`${label} ainda não está disponível nesta etapa.`);
  }, [toastError]);

  const renderActions = React.useCallback(
    (invoice: CreditCardInvoiceListItem) => (
      <InvoiceRowActions
        invoice={invoice}
        onViewDetails={openDetails}
        onPay={openPaymentModal}
        onCloseInvoice={() => unavailableAction("Fechar fatura")}
        onEditCharges={() => unavailableAction("Editar encargos")}
      />
    ),
    [openDetails, openPaymentModal, unavailableAction],
  );

  const columns = React.useMemo(
    () => getInvoicesTableColumns({ currency, renderActions }),
    [currency, renderActions],
  );

  const detailsInvoice = invoiceDetailsQuery.data ?? null;

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title={t("pages.invoices.title")}
          description="Acompanhe faturas, totais, pagamentos e saldo pendente dos cartões."
        />

        <Card className="border-none bg-transparent shadow-none">
          <CardHeader className="pb-2">
            <div className="flex flex-col gap-3">
              <CardTitle className="text-base">Lista</CardTitle>
              <div className="grid w-full gap-2 md:grid-cols-2 xl:grid-cols-4">
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar por cartão ou referência..."
                />
                <FilterSelect
                  value={creditCardId}
                  onChange={setCreditCardId}
                  options={[
                    { value: "", label: "Todos os cartões" },
                    ...creditCards.map((card) => ({
                      value: card.id,
                      label: card.name,
                    })),
                  ]}
                />
                <FilterSelect<InvoiceStatusFilter>
                  value={status}
                  onChange={setStatus}
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
                  value={dueDateRange}
                  onChange={setDueDateRange}
                  placeholder="Período de vencimento"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <InvoicesTable
              columns={columns}
              data={filteredInvoices}
              loading={invoicesTable.pageResponseQuery.isLoading}
              error={listErrorMessage}
              pageResponse={pageResponse}
              sortState={{
                sortKey: invoicesTable.sortKey,
                direction: invoicesTable.direction,
              }}
              onSortChange={invoicesTable.onSortChange}
              onPageChange={invoicesTable.onPageChange}
              onPageSizeChange={invoicesTable.onPageSizeChange}
              onRowClick={openDetails}
            />
          </CardContent>
        </Card>
      </div>

      <DetailsDrawer
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        title={
          detailsInvoice?.referenceLabel ??
          selectedInvoicePreview?.referenceLabel ??
          "Detalhes da fatura"
        }
        description={
          detailsInvoice?.creditCardName ??
          selectedInvoicePreview?.creditCardName ??
          "Visualize os lançamentos e pagamentos da fatura."
        }
        widthClassName="w-full sm:max-w-6xl"
        footer={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setDetailsOpen(false)}>
              Fechar
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => unavailableAction("Fechar fatura")}
              disabled={!detailsInvoice?.canClose}
            >
              Fechar fatura
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => unavailableAction("Editar encargos")}
              disabled={!detailsInvoice?.canEditCharges}
            >
              Editar encargos
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (!selectedInvoicePreview) return;
                openPaymentModal(selectedInvoicePreview);
              }}
              disabled={!detailsInvoice?.canPay || !selectedInvoicePreview}
            >
              Pagar fatura
            </Button>
          </div>
        }
      >
        <InvoiceDetails
          invoice={detailsInvoice}
          currency={currency}
          loading={invoiceDetailsQuery.isLoading || invoiceDetailsQuery.isFetching}
          error={detailsErrorMessage}
        />
      </DetailsDrawer>

      <InvoicePaymentModal
        open={paymentModalOpen}
        onOpenChange={setPaymentModalOpen}
        invoice={invoiceForPayment}
        invoiceDetails={
          invoiceDetailsQuery.data &&
          invoiceForPayment &&
          invoiceDetailsQuery.data.id === invoiceForPayment.id
            ? invoiceDetailsQuery.data
            : null
        }
        onPaid={() => {
          void invoicesTable.pageResponseQuery.refetch();
          if (selectedInvoiceId) {
            void invoiceDetailsQuery.refetch();
          }
        }}
      />
    </>
  );
}

