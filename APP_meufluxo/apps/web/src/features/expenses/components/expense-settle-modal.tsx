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
import { useSettleExpense, useSettleIncome } from "@/hooks/api";

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

function isValidIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00`);
  return !Number.isNaN(parsed.getTime());
}

export function ExpenseSettleModal({
  open,
  onOpenChange,
  expense,
  categoryName,
  subCategoryName,
  accounts,
  onSettled,
  mode = "expense",
  labels,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: ExpenseRecord | null;
  categoryName: string;
  subCategoryName: string | null;
  accounts: Array<{ id: string; name: string }>;
  onSettled: () => void;
  mode?: "expense" | "income";
  labels?: {
    title?: string;
    expectedAmount?: string;
    dueDate?: string;
    suggestedAccount?: string;
    actualAmount?: string;
    settledDate?: string;
    settledAccount?: string;
    success?: string;
    submit?: string;
    submitting?: string;
    submitError?: string;
  };
}) {
  const { success, error } = useToast();
  const { locale: appLocale } = useLocale();
  const intlLocale = intlLocaleFromAppLocale(appLocale);
  const settleExpenseMutation = useSettleExpense();
  const settleIncomeMutation = useSettleIncome();
  const settleMutation = mode === "income" ? settleIncomeMutation : settleExpenseMutation;

  const form = useForm<SettleFormValues>({
    defaultValues: {
      actualAmount: "",
      settledAt: toIsoDate(new Date()),
      settledAccountId: "",
      notes: "",
    },
  });

  const expenseId = expense?.id ?? null;
  const settledAccountIdField = form.watch("settledAccountId");

  const settledAccountIdNormalized =
    settledAccountIdField != null && String(settledAccountIdField).trim() !== ""
      ? String(settledAccountIdField).trim()
      : "";

  React.useEffect(() => {
    if (!open || !expense) return;
    form.reset({
      actualAmount: amountToEditString(expense.expectedAmount, intlLocale),
      settledAt: expense.dueDate || toIsoDate(new Date()),
      settledAccountId:
        expense.defaultAccountId != null ? String(expense.defaultAccountId).trim() : "",
      notes: expense.notes ?? "",
    });
    // Só ressincronizar ao abrir ou ao trocar o lançamento (`id`). Depender de `expense` por referência
    // refaz o reset a cada re-render do pai e apaga a conta que o usuário acabou de escolher.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `form.reset` estável; valores iniciais vêm de `expense` no momento do reset
  }, [open, expenseId, intlLocale]);

  const isSubmitting = settleMutation.isPending;
  const selectedAccountName =
    accounts.find((account) => account.id === expense?.defaultAccountId)?.name ?? "—";

  const onSubmit = form.handleSubmit(async (values) => {
    if (!expense) return;

    const actualAmount = parseMoneyInput(values.actualAmount);
    if (!Number.isFinite(actualAmount) || actualAmount <= 0) {
      form.setError("actualAmount", {
        message:
          mode === "income"
            ? "Informe um valor recebido maior que zero."
            : "Informe um valor pago maior que zero.",
      });
      return;
    }

    if (!values.settledAt) {
      form.setError("settledAt", {
        message:
          mode === "income"
            ? "Informe a data do recebimento."
            : "Informe a data da baixa.",
      });
      return;
    }
    if (!isValidIsoDate(values.settledAt)) {
      form.setError("settledAt", {
        message:
          mode === "income"
            ? "Informe uma data de recebimento válida."
            : "Informe uma data de pagamento válida.",
      });
      return;
    }
    if (!values.settledAccountId) {
      form.setError("settledAccountId", {
        message:
          mode === "income"
            ? "Selecione a conta de destino do recebimento."
            : "Selecione a conta utilizada para o pagamento.",
      });
      return;
    }

    try {
      await settleMutation.mutateAsync({
        id: expense.id,
        request: {
          actualAmount,
          settledAt: values.settledAt,
          settledAccountId: Number(values.settledAccountId),
          notes: values.notes?.trim() ? values.notes.trim() : null,
        },
      });
      success(
        labels?.success ??
          (mode === "income"
            ? "Recebimento confirmado com sucesso."
            : "Despesa baixada com sucesso."),
      );
      onOpenChange(false);
      onSettled();
    } catch (err) {
      const apiError = extractApiError(err);
      error(
        apiError?.detail ??
          labels?.submitError ??
          (mode === "income"
            ? "Não foi possível confirmar o recebimento."
            : "Não foi possível concluir a baixa."),
      );
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {labels?.title ??
              (mode === "income" ? "Confirmação manual de recebimento" : "Baixa manual da despesa")}
          </DialogTitle>
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
                <p>{labels?.expectedAmount ?? "Valor previsto"}: {formatMoney(expense.expectedAmount)}</p>
                <p>{labels?.dueDate ?? "Vencimento"}: {formatDate(expense.dueDate)}</p>
                <p>Documento: {expense.document?.trim() ? expense.document : "—"}</p>
                <p>Tipo: {expense.amountBehavior === "FIXED" ? "Fixo" : "Estimado"}</p>
                <p>{labels?.suggestedAccount ?? "Conta sugerida"}: {selectedAccountName}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="expense-settle-actual-amount">
                  {labels?.actualAmount ?? (mode === "income" ? "Valor recebido/real" : "Valor pago/real")}
                </Label>
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
                <Label htmlFor="expense-settle-date">
                  {labels?.settledDate ??
                    (mode === "income" ? "Data do recebimento" : "Data da baixa/pagamento")}
                </Label>
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
                <Label htmlFor="expense-settle-account">
                  {labels?.settledAccount ??
                    (mode === "income"
                      ? "Conta de destino do recebimento"
                      : "Conta utilizada para débito")}
                </Label>
                <Select
                  key={`settle-account-${expenseId ?? "none"}`}
                  value={settledAccountIdNormalized || "__none"}
                  onValueChange={(value) => {
                    form.setValue(
                      "settledAccountId",
                      value === "__none" ? "" : String(value).trim(),
                      {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true,
                      },
                    );
                    form.clearErrors("settledAccountId");
                  }}
                >
                  <SelectTrigger
                    id="expense-settle-account"
                    className={`h-10 w-full rounded-xl border bg-background px-3 py-2 text-sm shadow-sm transition-colors hover:bg-muted/50 focus:ring-2 focus:ring-ring focus:ring-offset-2 data-[state=open]:border-primary/50 data-[state=open]:ring-2 data-[state=open]:ring-primary/20 ${
                      form.formState.errors.settledAccountId
                        ? "border-destructive focus:ring-destructive/20"
                        : "border-input hover:border-input"
                    }`}
                  >
                    <SelectValue placeholder="Selecione uma conta" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border bg-popover shadow-lg" position="popper" sideOffset={6}>
                    <SelectItem value="__none" className="rounded-lg py-2 cursor-pointer focus:bg-accent">
                      Selecione uma conta
                    </SelectItem>
                    {accounts.map((account) => (
                      <SelectItem
                        key={account.id}
                        value={String(account.id).trim()}
                        className="rounded-lg py-2 cursor-pointer focus:bg-accent"
                      >
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.settledAccountId ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.settledAccountId.message}
                  </p>
                ) : null}
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
                {isSubmitting
                  ? labels?.submitting ?? "Confirmando..."
                  : labels?.submit ?? (mode === "income" ? "Confirmar recebimento" : "Confirmar baixa")}
              </Button>
            </DialogFooter>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

