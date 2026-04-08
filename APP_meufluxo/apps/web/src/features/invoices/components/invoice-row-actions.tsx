"use client";

import { Coins, Eye, Lock, ReceiptText } from "lucide-react";

import type { CreditCardInvoiceListItem } from "@meufluxo/types";

import { RowActionButtons, type RowActionButtonItem } from "@/components/patterns";

export function InvoiceRowActions({
  invoice,
  onViewDetails,
  onPay,
  onCloseInvoice,
  onEditCharges,
  isPaying,
}: {
  invoice: CreditCardInvoiceListItem;
  onViewDetails: (invoice: CreditCardInvoiceListItem) => void;
  onPay: (invoice: CreditCardInvoiceListItem) => void;
  onCloseInvoice: (invoice: CreditCardInvoiceListItem) => void;
  onEditCharges: (invoice: CreditCardInvoiceListItem) => void;
  isPaying?: boolean;
}) {
  const actions: RowActionButtonItem[] = [
    {
      key: "details",
      label: "Ver detalhes",
      icon: Eye,
      ariaLabel: "Ver detalhes da fatura",
      onClick: () => onViewDetails(invoice),
    },
    {
      key: "close",
      label: "Fechar fatura",
      icon: Lock,
      ariaLabel: "Fechar fatura",
      onClick: () => onCloseInvoice(invoice),
    },
    {
      key: "pay",
      label: "Pagar fatura",
      icon: Coins,
      ariaLabel: "Pagar fatura",
      disabled: isPaying,
      onClick: () => onPay(invoice),
    },
    {
      key: "charges",
      label: "Editar encargos",
      icon: ReceiptText,
      ariaLabel: "Editar encargos da fatura",
      onClick: () => onEditCharges(invoice),
    },
  ];

  return <RowActionButtons actions={actions} density="default" />;
}
