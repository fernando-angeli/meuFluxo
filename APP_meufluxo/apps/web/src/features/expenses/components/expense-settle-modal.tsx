"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";

import type { ExpenseRecord } from "@meufluxo/types";
import { amountToEditString, intlLocaleFromAppLocale, parseMoneyInput } from "@meufluxo/utils";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MinorUnitMoneyInput } from "@/components/ui/minor-unit-money-input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/toast";
import { extractApiError } from "@/lib/api-error";
import { useLocale } from "@/lib/i18n";
import { useSettleExpense } from "@/hooks/api";

type SettleFormValues = {
  actualAmount: string;
  settledAt: string;
  settledAccountId: string;
  notes: string;
};

function formatDate(value: string) {
  if (!value) return "—";
  const [y, m, d] = value.split("-");
  if (!y || !m || !d) return value;
  return `${d}/${m}/${y}`;
}

function formatMoney(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function toIsoDate(value: Date) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
}

export function ExpenseSettleModal({
  open,
  onOpenChange,
  expense,
  categoryName,
  subCategoryName,
  accounts,
  onSettled,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: ExpenseRecord | null;
  categoryName: string;
  subCategoryName: string | null;
  accounts: Array<{ id: string; name: string }>;
  onSettled: () => void;
}) {
  const { success, error } = useToast();
  const { locale: appLocale } = useLocale();
  const intlLocale = intlLocaleFromAppLocale(appLocale);
  const settleMutation = useSettleExpense();

  const form = useForm<SettleFormValues>({
    defaultValues: {
      actualAmount: "",
      settledAt: toIsoDate(new Date()),
      settledAccountId: "",
      notes: "",
    },
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset({
      actualAmount: expense ? amountToEditString(expense.expectedAmount, intlLocale) : "",
      settledAt: toIsoDate(new Date()),
      settledAccountId: expense?.defaultAccountId ?? "",
      notes: expense?.notes ?? "",
    });
  }, [expense, form, intlLocale, open]);

  const isSubmitting = settleMutation.isPending;
  const selectedAccountName =
    accounts.find((account) => account.id === expense?.defaultAccountId)?.name ?? "—";

  const onSubmit = form.handleSubmit(async (values) => {
    if (!expense) return;

    const actualAmount = parseMoneyInput(values.actualAmount);
    if (!Number.isFinite(actualAmount) || actualAmount <= 0) {
      form.setError("actualAmount", { message: "Informe um valor pago maior que zero." });
      return;
    }

    if (!values.settledAt) {
      form.setError("settledAt", { message: "Informe a data da baixa." });
      return;
    }

    try {
      await settleMutation.mutateAsync({
        id: expense.id,
        request: {
          actualAmount,
          settledAt: values.settledAt,
          settledAccountId: values.settledAccountId ? Number(values.settledAccountId) : null,
          notes: values.notes?.trim() ? values.notes.trim() : null,
        },
      });
      success("Despesa baixada com sucesso.");
      onOpenChange(false);
      onSettled();
    } catch (err) {
      const apiError = extractApiError(err);
      error(apiError?.detail ?? "Não foi possível concluir a baixa.");
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Baixa manual da despesa</DialogTitle>
        </DialogHeader>

        {expense ? (
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="rounded-lg border bg-muted/20 p-3">
              <p className="text-sm font-medium">{expense.description}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {categoryName}
                {subCategoryName ? ` / ${subCategoryName}` : ""}
              </p>
              <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                <p>Valor previsto: {formatMoney(expense.expectedAmount)}</p>
                <p>Vencimento: {formatDate(expense.dueDate)}</p>
                <p>Tipo: {expense.amountBehavior === "FIXED" ? "Fixo" : "Estimado"}</p>
                <p>Conta sugerida: {selectedAccountName}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="expense-settle-actual-amount">Valor pago/real</Label>
                <Controller
                  name="actualAmount"
                  control={form.control}
                  render={({ field }) => (
                    <MinorUnitMoneyInput
                      id="expense-settle-actual-amount"
                      ref={field.ref}
                      name={field.name}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                  )}
                />
                {form.formState.errors.actualAmount ? (
                  <p className="text-xs text-destructive">{form.formState.errors.actualAmount.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="expense-settle-date">Data da baixa/pagamento</Label>
                <Input
                  id="expense-settle-date"
                  type="date"
                  className="text-center"
                  {...form.register("settledAt")}
                />
                {form.formState.errors.settledAt ? (
                  <p className="text-xs text-destructive">{form.formState.errors.settledAt.message}</p>
                ) : null}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="expense-settle-account">Conta utilizada para débito</Label>
                <Select
                  value={form.watch("settledAccountId") || "__none"}
                  onValueChange={(value) =>
                    form.setValue("settledAccountId", value === "__none" ? "" : value, { shouldDirty: true })
                  }
                >
                  <SelectTrigger
                    id="expense-settle-account"
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors hover:bg-muted/50 hover:border-input focus:ring-2 focus:ring-ring focus:ring-offset-2 data-[state=open]:border-primary/50 data-[state=open]:ring-2 data-[state=open]:ring-primary/20"
                  >
                    <SelectValue placeholder="Selecione uma conta (opcional)" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border bg-popover shadow-lg" position="popper" sideOffset={6}>
                    <SelectItem value="__none" className="rounded-lg py-2 cursor-pointer focus:bg-accent">
                      Selecione uma conta (opcional)
                    </SelectItem>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id} className="rounded-lg py-2 cursor-pointer focus:bg-accent">
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="expense-settle-notes">Observações</Label>
                <textarea
                  id="expense-settle-notes"
                  className="flex min-h-[88px] w-full rounded-lg border bg-input px-3 py-2 text-sm"
                  {...form.register("notes")}
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Confirmando..." : "Confirmar baixa"}
              </Button>
            </DialogFooter>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

