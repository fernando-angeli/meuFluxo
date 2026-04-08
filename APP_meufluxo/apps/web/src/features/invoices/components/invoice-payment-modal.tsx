"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { CreditCardInvoiceDetails, CreditCardInvoiceListItem } from "@meufluxo/types";
import { amountToEditString, formatCurrency, parseMoneyInput } from "@meufluxo/utils";

import { FormFieldError } from "@/components/form";
import { FormDialogShell } from "@/components/patterns";
import { useToast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { MinorUnitMoneyInput } from "@/components/ui/minor-unit-money-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAccounts, useCreateInvoicePayment } from "@/hooks/api";
import { useAuthOptional } from "@/hooks/useAuth";
import { extractApiError, getInputErrorClass, mapApiFieldErrors } from "@/lib/api-error";
import { cn } from "@/lib/utils";
import { InvoiceStatusBadge } from "@/features/invoices/components/invoice-status-badge";

function toIsoDate(value: Date) {
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, "0");
  const d = String(value.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const invoicePaymentFormSchema = z.object({
  accountId: z.string().min(1, "A conta de pagamento é obrigatória."),
  paymentDate: z.string().min(1, "A data de pagamento é obrigatória."),
  amount: z
    .string()
    .trim()
    .min(1, "O valor é obrigatório.")
    .refine((value) => Number.isFinite(parseMoneyInput(value)) && parseMoneyInput(value) > 0, {
      message: "Informe um valor válido.",
    }),
  notes: z.string().max(1000, "As observações devem ter no máximo 1000 caracteres.").optional(),
});

type InvoicePaymentFormValues = z.infer<typeof invoicePaymentFormSchema>;

export function InvoicePaymentModal({
  open,
  onOpenChange,
  invoice,
  invoiceDetails,
  onPaid,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: CreditCardInvoiceListItem | null;
  invoiceDetails?: CreditCardInvoiceDetails | null;
  onPaid?: () => void;
}) {
  const auth = useAuthOptional();
  const { success, error } = useToast();
  const createPaymentMutation = useCreateInvoicePayment();
  const { data: accounts = [] } = useAccounts();
  const currency = (auth?.preferences?.currency as "BRL" | "USD" | "EUR") ?? "BRL";

  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [generalError, setGeneralError] = React.useState<string | null>(null);

  const summary = React.useMemo(() => {
    const totalAmount = invoiceDetails?.totalAmount ?? invoice?.totalAmount ?? 0;
    const paidAmount = invoiceDetails?.paidAmount ?? invoice?.paidAmount ?? 0;
    const remainingAmount = invoiceDetails?.remainingAmount ?? invoice?.remainingAmount ?? 0;
    const status = invoiceDetails?.status ?? invoice?.status ?? "OPEN";
    const statusLabel = invoiceDetails?.statusLabel ?? invoice?.statusLabel ?? null;
    return {
      totalAmount,
      paidAmount,
      remainingAmount,
      status,
      statusLabel,
    };
  }, [invoice, invoiceDetails]);

  const form = useForm<InvoicePaymentFormValues>({
    resolver: zodResolver(invoicePaymentFormSchema),
    defaultValues: {
      accountId: "",
      paymentDate: toIsoDate(new Date()),
      amount: "",
      notes: "",
    },
  });

  React.useEffect(() => {
    if (!open) return;
    setFieldErrors({});
    setGeneralError(null);
    form.reset({
      accountId: "",
      paymentDate: toIsoDate(new Date()),
      amount:
        invoice && summary.remainingAmount > 0
          ? amountToEditString(summary.remainingAmount)
          : "",
      notes: "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, invoice?.id, summary.remainingAmount]);

  const clearFieldError = React.useCallback((field: string) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const onSubmit = form.handleSubmit(async (values) => {
    if (!invoice) return;
    setFieldErrors({});
    setGeneralError(null);
    const parsedAmount = parseMoneyInput(values.amount);
    const remainingAmount = summary.remainingAmount;

    if (parsedAmount > remainingAmount) {
      const message = "O valor do pagamento não pode ultrapassar o saldo pendente.";
      form.setError("amount", { type: "manual", message });
      error(message);
      return;
    }

    try {
      await createPaymentMutation.mutateAsync({
        invoiceId: Number(invoice.id),
        accountId: Number(values.accountId),
        paymentDate: values.paymentDate,
        amount: parsedAmount,
        notes: values.notes?.trim() ? values.notes.trim() : null,
      });
      success("Pagamento registrado com sucesso");
      onPaid?.();
      onOpenChange(false);
    } catch (err) {
      const apiError = extractApiError(err);
      if (apiError?.errors?.length) {
        setFieldErrors(mapApiFieldErrors(apiError.errors));
        return;
      }
      const message = apiError?.detail ?? "Não foi possível registrar o pagamento.";
      setGeneralError(message);
      error(message);
    }
  });

  const isSubmitting = createPaymentMutation.isPending;

  return (
    <FormDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title="Pagar fatura"
      description={
        invoice
          ? `Registrar pagamento para ${invoice.creditCardName} (${invoice.referenceLabel}).`
          : "Registrar pagamento de fatura."
      }
      generalError={generalError}
      contentClassName="max-w-xl"
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="rounded-lg border bg-card p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-muted-foreground">Resumo da fatura</p>
            <InvoiceStatusBadge status={summary.status} label={summary.statusLabel} />
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="rounded-md border bg-background px-2 py-1.5">
              <p className="text-[11px] text-muted-foreground">Total da fatura</p>
              <p className="text-sm font-semibold tabular-nums">
                {formatCurrency(summary.totalAmount, currency)}
              </p>
            </div>
            <div className="rounded-md border bg-background px-2 py-1.5">
              <p className="text-[11px] text-muted-foreground">Pago até agora</p>
              <p className="text-sm font-semibold tabular-nums">
                {formatCurrency(summary.paidAmount, currency)}
              </p>
            </div>
            <div className="rounded-md border bg-background px-2 py-1.5">
              <p className="text-[11px] text-muted-foreground">Saldo pendente</p>
              <p className="text-sm font-semibold tabular-nums">
                {formatCurrency(summary.remainingAmount, currency)}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Conta de pagamento</Label>
          <Select
            value={form.watch("accountId") || "__none__"}
            disabled={isSubmitting}
            onValueChange={(value) => {
              form.setValue("accountId", value === "__none__" ? "" : value, {
                shouldDirty: true,
              });
              clearFieldError("accountId");
            }}
          >
            <SelectTrigger className={cn(getInputErrorClass(fieldErrors.accountId))}>
              <SelectValue placeholder="Selecione uma conta" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Selecione</SelectItem>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormFieldError message={fieldErrors.accountId ?? form.formState.errors.accountId?.message} />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="invoice-payment-date">Data de pagamento</Label>
            <input
              id="invoice-payment-date"
              type="date"
              className={cn(
                "flex h-10 w-full rounded-lg border bg-background px-3 py-2 text-sm",
                getInputErrorClass(fieldErrors.paymentDate ?? form.formState.errors.paymentDate?.message),
              )}
              {...form.register("paymentDate", {
                onChange: () => clearFieldError("paymentDate"),
              })}
            />
            <FormFieldError
              message={fieldErrors.paymentDate ?? form.formState.errors.paymentDate?.message}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="invoice-payment-amount">Valor</Label>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-xs"
                  onClick={() => {
                    const canUseTotal = summary.paidAmount <= 0.00001;
                    const amountValue = canUseTotal
                      ? summary.totalAmount
                      : summary.remainingAmount;
                    form.setValue("amount", amountToEditString(amountValue), {
                      shouldDirty: true,
                      shouldTouch: true,
                    });
                    clearFieldError("amount");
                  }}
                  disabled={isSubmitting || summary.totalAmount <= 0}
                >
                  Pagar total
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-xs"
                  onClick={() => {
                    form.setValue(
                      "amount",
                      amountToEditString(summary.remainingAmount),
                      {
                        shouldDirty: true,
                        shouldTouch: true,
                      },
                    );
                    clearFieldError("amount");
                  }}
                  disabled={isSubmitting || summary.remainingAmount <= 0}
                >
                  Usar saldo pendente
                </Button>
              </div>
            </div>
            <MinorUnitMoneyInput
              id="invoice-payment-amount"
              value={form.watch("amount") || ""}
              onChange={(value) => {
                form.setValue("amount", value, { shouldDirty: true });
                clearFieldError("amount");
              }}
              onBlur={() => {
                void form.trigger("amount");
              }}
              className={cn(getInputErrorClass(fieldErrors.amount ?? form.formState.errors.amount?.message))}
            />
            <FormFieldError message={fieldErrors.amount ?? form.formState.errors.amount?.message} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="invoice-payment-notes">Observação</Label>
          <textarea
            id="invoice-payment-notes"
            rows={3}
            placeholder="Opcional"
            className={cn(
              "flex min-h-[80px] w-full resize-y rounded-lg border bg-input px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
              getInputErrorClass(fieldErrors.notes ?? form.formState.errors.notes?.message),
            )}
            {...form.register("notes", {
              onChange: () => clearFieldError("notes"),
            })}
          />
          <FormFieldError message={fieldErrors.notes ?? form.formState.errors.notes?.message} />
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting || !invoice}>
            {isSubmitting ? "Salvando..." : "Registrar pagamento"}
          </Button>
        </DialogFooter>
      </form>
    </FormDialogShell>
  );
}
