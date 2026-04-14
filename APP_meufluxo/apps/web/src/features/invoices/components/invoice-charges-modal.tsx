"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import type { InvoiceDetails } from "@meufluxo/types";
import { amountToEditString, intlLocaleFromAppLocale, parseMoneyInput } from "@meufluxo/utils";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MinorUnitMoneyInput } from "@/components/ui/minor-unit-money-input";
import { useLocale } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { extractApiError } from "@/lib/api-error";
import { useUpdateInvoiceCharges } from "@/hooks/api";

type InvoiceChargesFormValues = {
  interestAmount: string;
  lateFeeAmount: string;
  otherFeesAmount: string;
};

export function InvoiceChargesModal({
  open,
  onOpenChange,
  invoice,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: InvoiceDetails | null;
  onSaved: () => void;
}) {
  const { locale: appLocale } = useLocale();
  const intlLocale = intlLocaleFromAppLocale(appLocale);
  const { success, error } = useToast();
  const chargesMutation = useUpdateInvoiceCharges();

  const form = useForm<InvoiceChargesFormValues>({
    defaultValues: {
      interestAmount: "",
      lateFeeAmount: "",
      otherFeesAmount: "",
    },
  });

  React.useEffect(() => {
    if (!open || !invoice) return;
    form.reset({
      interestAmount: amountToEditString(invoice.interestAmount ?? 0, intlLocale),
      lateFeeAmount: amountToEditString(invoice.lateFeeAmount ?? 0, intlLocale),
      otherFeesAmount: amountToEditString(invoice.otherFeesAmount ?? 0, intlLocale),
    });
  }, [form, intlLocale, invoice, open]);

  const isSubmitting = chargesMutation.isPending;

  const onSubmit = form.handleSubmit(async (values) => {
    if (!invoice) return;
    try {
      await chargesMutation.mutateAsync({
        invoiceId: invoice.id,
        request: {
          interestAmount: Math.max(0, parseMoneyInput(values.interestAmount)),
          lateFeeAmount: Math.max(0, parseMoneyInput(values.lateFeeAmount)),
          otherFeesAmount: Math.max(0, parseMoneyInput(values.otherFeesAmount)),
        },
      });
      success("Encargos atualizados com sucesso.");
      onOpenChange(false);
      onSaved();
    } catch (err) {
      const apiError = extractApiError(err);
      error(apiError?.detail ?? "Não foi possível atualizar os encargos da fatura.");
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar encargos</DialogTitle>
        </DialogHeader>

        {invoice ? (
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="invoice-charges-interest">Juros rotativo</Label>
              <Controller
                control={form.control}
                name="interestAmount"
                render={({ field }) => (
                  <MinorUnitMoneyInput
                    id="invoice-charges-interest"
                    ref={field.ref}
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoice-charges-late-fee">Multa</Label>
              <Controller
                control={form.control}
                name="lateFeeAmount"
                render={({ field }) => (
                  <MinorUnitMoneyInput
                    id="invoice-charges-late-fee"
                    ref={field.ref}
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoice-charges-other-fees">Outras tarifas</Label>
              <Controller
                control={form.control}
                name="otherFeesAmount"
                render={({ field }) => (
                  <MinorUnitMoneyInput
                    id="invoice-charges-other-fees"
                    ref={field.ref}
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : "Salvar encargos"}
              </Button>
            </DialogFooter>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
