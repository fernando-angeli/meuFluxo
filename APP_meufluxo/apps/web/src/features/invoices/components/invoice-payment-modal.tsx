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
import { useCreateInvoicePayment } from "@/hooks/api";

type InvoicePaymentFormValues = {
  accountId: string;
  paymentDate: string;
  amount: string;
  notes: string;
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

  const form = useForm<InvoicePaymentFormValues>({
    defaultValues: {
      accountId: "",
      paymentDate: toIsoToday(),
      amount: "",
      notes: "",
    },
  });

  React.useEffect(() => {
    if (!open || !invoice) return;
    form.reset({
      accountId: "",
      paymentDate: toIsoToday(),
      amount: amountToEditString(invoice.remainingAmount, intlLocale),
      notes: "",
    });
  }, [form, intlLocale, invoice, open]);

  const isSubmitting = paymentMutation.isPending;
  const remainingAmount = invoice?.remainingAmount ?? 0;
  const totalAmount = invoice?.totalAmount ?? 0;
  const paidAmount = invoice?.paidAmount ?? 0;

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
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Pagar fatura</DialogTitle>
        </DialogHeader>

        {invoice ? (
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="rounded-lg border bg-muted/20 p-3">
              <p className="text-sm font-medium">{invoice.referenceLabel}</p>
              <div className="mt-2 grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
                <p>Total: {formatCurrency(invoice.totalAmount, "BRL")}</p>
                <p>Pago: {formatCurrency(invoice.paidAmount, "BRL")}</p>
                <p>Saldo pendente: {formatCurrency(invoice.remainingAmount, "BRL")}</p>
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
