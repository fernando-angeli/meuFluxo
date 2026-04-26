"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import type { InvoiceDetails } from "@meufluxo/types";
import {
  amountToEditString,
  intlLocaleFromAppLocale,
  parseMoneyInput,
  formatCurrency,
} from "@meufluxo/utils";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MinorUnitMoneyInput } from "@/components/ui/minor-unit-money-input";
import { FormFieldError } from "@/components/form";
import { useLocale } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { extractApiError } from "@/lib/api-error";
import { useCloseInvoice, useCreateInvoicePayment } from "@/hooks/api";
import { ChoiceRadioGroup } from "@/components/ui/choice-radio-group";

type InvoicePaymentFormValues = {
  accountId: string;
  paymentDate: string;
  amount: string;
  notes: string;
  partialPaymentHandling: "KEEP_OPEN" | "CARRY_TO_NEXT_INVOICE";
};

function toIsoToday(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function InvoicePaymentModal({
  open,
  onOpenChange,
  invoice,
  accounts,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: InvoiceDetails | null;
  accounts: Array<{ id: string; name: string }>;
  onSaved: () => void;
}) {
  const { locale: appLocale } = useLocale();
  const intlLocale = intlLocaleFromAppLocale(appLocale);
  const { success, error } = useToast();
  const paymentMutation = useCreateInvoicePayment();
  const closeInvoiceMutation = useCloseInvoice();

  const form = useForm<InvoicePaymentFormValues>({
    defaultValues: {
      accountId: "",
      paymentDate: toIsoToday(),
      amount: "",
      notes: "",
      partialPaymentHandling: "KEEP_OPEN",
    },
  });

  const paymentAmountText = form.watch("amount");
  const paymentAmount = React.useMemo(() => parseMoneyInput(paymentAmountText), [paymentAmountText]);

  React.useEffect(() => {
    if (!open || !invoice) return;
    form.reset({
      accountId: "",
      paymentDate: toIsoToday(),
      amount: amountToEditString(invoice.remainingAmount, intlLocale),
      notes: "",
      partialPaymentHandling: "KEEP_OPEN",
    });
  }, [form, intlLocale, invoice, open]);

  const isSubmitting = paymentMutation.isPending || closeInvoiceMutation.isPending;
  const remainingAmount = invoice?.remainingAmount ?? 0;
  const totalAmount = invoice?.totalAmount ?? 0;
  const paidAmount = invoice?.paidAmount ?? 0;
  const isPartialPayment =
    Number.isFinite(paymentAmount) &&
    paymentAmount > 0 &&
    paymentAmount < remainingAmount;

  const onSubmit = form.handleSubmit(async (values) => {
    if (!invoice) return;

    const amount = parseMoneyInput(values.amount);
    if (!values.accountId) {
      form.setError("accountId", { message: "Selecione a conta de pagamento." });
      return;
    }
    if (!values.paymentDate) {
      form.setError("paymentDate", { message: "Informe a data do pagamento." });
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      form.setError("amount", { message: "Informe um valor maior que zero." });
      return;
    }
    if (amount > remainingAmount) {
      form.setError("amount", { message: "Valor não pode ultrapassar o saldo pendente." });
      return;
    }

    try {
      await paymentMutation.mutateAsync({
        invoiceId: invoice.id,
        request: {
          accountId: Number(values.accountId),
          paymentDate: values.paymentDate,
          amount,
          notes: values.notes?.trim() ? values.notes.trim() : null,
        },
      });

      if (amount < remainingAmount && values.partialPaymentHandling === "CARRY_TO_NEXT_INVOICE") {
        await closeInvoiceMutation.mutateAsync(invoice.id);
      }

      success("Pagamento registrado com sucesso.");
      onOpenChange(false);
      onSaved();
    } catch (err) {
      const apiError = extractApiError(err);
      error(apiError?.detail ?? "Não foi possível registrar o pagamento da fatura.");
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[27rem]">
        <DialogHeader>
          <DialogTitle>Pagar fatura</DialogTitle>
        </DialogHeader>

        {invoice ? (
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="rounded-lg border bg-muted/20 p-3">
              <p className="text-sm font-medium">{invoice.referenceLabel}</p>
              <div className="mt-2 grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
                <p>Total: <br />
                  <span className="tabular-nums">{formatCurrency(invoice.totalAmount, "BRL")}</span>
                </p>
                <p>Pago: <br />
                  <span className="tabular-nums">{formatCurrency(invoice.paidAmount, "BRL")}</span>
                </p>
                <p>Saldo pendente: <br />
                  <span className="tabular-nums">{formatCurrency(invoice.remainingAmount, "BRL")}</span>
                </p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    form.setValue(
                      "amount",
                      amountToEditString(
                        paidAmount > 0 ? remainingAmount : totalAmount,
                        intlLocale,
                      ),
                    )
                  }
                >
                  Pagar total
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => form.setValue("amount", amountToEditString(invoice.remainingAmount, intlLocale))}
                >
                  Usar saldo pendente
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="invoice-payment-account">Conta de pagamento</Label>
                <select
                  id="invoice-payment-account"
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                  value={form.watch("accountId")}
                  onChange={(event) => {
                    form.setValue("accountId", event.target.value, { shouldDirty: true });
                    form.clearErrors("accountId");
                  }}
                >
                  <option value="">Selecione a conta</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </select>
                <FormFieldError message={form.formState.errors.accountId?.message} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="invoice-payment-date">Data do pagamento</Label>
                <Input id="invoice-payment-date" type="date" {...form.register("paymentDate")} />
                <FormFieldError message={form.formState.errors.paymentDate?.message} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="invoice-payment-amount">Valor do pagamento</Label>
                <Controller
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <MinorUnitMoneyInput
                      id="invoice-payment-amount"
                      ref={field.ref}
                      name={field.name}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                  )}
                />
                <FormFieldError message={form.formState.errors.amount?.message} />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="invoice-payment-notes">Observação</Label>
                <textarea
                  id="invoice-payment-notes"
                  className="h-20 w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  {...form.register("notes")}
                />
              </div>

              {isPartialPayment ? (
                <div className="space-y-2 sm:col-span-2">
                  <Label id="invoice-partial-payment-handling">Pagamento parcial</Label>
                  <ChoiceRadioGroup
                    aria-labelledby="invoice-partial-payment-handling"
                    value={form.watch("partialPaymentHandling")}
                    onChange={(value) =>
                      form.setValue("partialPaymentHandling", value, { shouldDirty: true })
                    }
                    options={[
                      {
                        value: "KEEP_OPEN",
                        title: "Manter fatura em aberto",
                        description: "A fatura permanece em aberto com status de pagamento parcial.",
                      },
                      {
                        value: "CARRY_TO_NEXT_INVOICE",
                        title: "Incluir saldo na próxima fatura",
                        description: "Fecha esta fatura e carrega o saldo restante para a próxima.",
                      },
                    ]}
                    disabled={isSubmitting}
                  />
                </div>
              ) : null}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : "Confirmar pagamento"}
              </Button>
            </DialogFooter>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
