"use client";

import { Eye, Lock, Wallet } from "lucide-react";
import type { Invoice } from "@meufluxo/types";

import { RowActionButtons } from "@/components/patterns/row-action-buttons";

type InvoiceRowActionsProps = {
  invoice: Invoice;
  onViewDetails: (invoice: Invoice) => void;
  onCloseInvoice: (invoice: Invoice) => void;
  onPayInvoice: (invoice: Invoice) => void;
};

function canCloseInvoice(invoice: Invoice): boolean {
  if (invoice.canClose != null) return invoice.canClose;
  return invoice.status === "OPEN";
}

function canPayInvoice(invoice: Invoice): boolean {
  if (invoice.canPay != null) return invoice.canPay;
  if (invoice.status === "PAID") return false;
  return invoice.remainingAmount > 0;
}

export function InvoiceRowActions({
  invoice,
  onViewDetails,
  onCloseInvoice,
  onPayInvoice,
}: InvoiceRowActionsProps) {
  return (
    <RowActionButtons
      actions={[
        {
          key: "details",
          label: "Ver detalhes",
          icon: Eye,
          onClick: () => onViewDetails(invoice),
          ariaLabel: "Ver detalhes da fatura",
        },
        {
          key: "close",
          label: "Fechar fatura",
          icon: Lock,
          onClick: () => onCloseInvoice(invoice),
          disabled: !canCloseInvoice(invoice),
          ariaLabel: "Fechar fatura",
        },
        {
          key: "pay",
          label: "Pagar fatura",
          icon: Wallet,
          onClick: () => onPayInvoice(invoice),
          disabled: !canPayInvoice(invoice),
          ariaLabel: "Pagar fatura",
        },
      ]}
    />
  );
}
