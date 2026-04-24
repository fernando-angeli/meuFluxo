"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import type { CreditCard } from "@meufluxo/types";
import { parseMoneyInput } from "@meufluxo/utils";

import { FormFieldError } from "@/components/form";
import { FormDialogShell } from "@/components/patterns";
import { useToast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MinorUnitMoneyInput } from "@/components/ui/minor-unit-money-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAccounts, useCreateCreditCard, useUpdateCreditCard } from "@/hooks/api";
import { extractApiError, getInputErrorClass, mapApiFieldErrors } from "@/lib/api-error";
import { cn } from "@/lib/utils";

import {
  creditCardFormSchema,
  type CreditCardFormValues,
} from "@/features/credit-cards/credit-card-form.schema";

export type CreditCardFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creditCard: CreditCard | null;
};

export function CreditCardFormModal({
  open,
  onOpenChange,
  creditCard,
}: CreditCardFormModalProps) {
  const isEdit = !!creditCard;
  const { success, error } = useToast();
  const createMutation = useCreateCreditCard();
  const updateMutation = useUpdateCreditCard();
  const { data: accounts = [] } = useAccounts();

  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [generalError, setGeneralError] = React.useState<string | null>(null);

  const clearFieldError = React.useCallback((field: string) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const form = useForm<CreditCardFormValues>({
    resolver: zodResolver(creditCardFormSchema),
    defaultValues: {
      name: "",
      brand: "VISA",
      closingDay: 1,
      dueDay: 1,
      creditLimit: "",
      defaultPaymentAccountId: "",
      notes: "",
      active: true,
    },
  });

  React.useEffect(() => {
    if (!open) return;

    setFieldErrors({});
    setGeneralError(null);

    if (creditCard) {
      form.reset({
        name: creditCard.name ?? "",
        brand: creditCard.brand ?? "VISA",
        closingDay: creditCard.closingDay ?? 1,
        dueDay: creditCard.dueDay ?? 1,
        creditLimit:
          creditCard.creditLimit != null ? String(creditCard.creditLimit) : "",
        defaultPaymentAccountId:
          creditCard.defaultPaymentAccountId != null &&
          String(creditCard.defaultPaymentAccountId).trim() !== ""
            ? String(creditCard.defaultPaymentAccountId).trim()
            : "",
        notes: creditCard.notes ?? "",
        active: !!creditCard.meta.active,
      });
      return;
    }

    form.reset({
      name: "",
      brand: "VISA",
      closingDay: 1,
      dueDay: 1,
      creditLimit: "",
      defaultPaymentAccountId: "",
      notes: "",
      active: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, creditCard?.id]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const onSubmit = form.handleSubmit(async (values) => {
    setFieldErrors({});
    setGeneralError(null);

    const name = values.name.trim();
    const notes = values.notes.trim();
    const creditLimit = values.creditLimit.trim();

    const request = {
      name,
      brand: values.brand,
      closingDay: Number(values.closingDay),
      dueDay: Number(values.dueDay),
      creditLimit: creditLimit ? parseMoneyInput(creditLimit) : null,
      defaultPaymentAccountId: values.defaultPaymentAccountId
        ? Number(values.defaultPaymentAccountId)
        : null,
      notes: notes ? notes : null,
      active: values.active,
    } as const;

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({
          id: creditCard!.id,
          request,
        });
        success("Cartão atualizado com sucesso");
      } else {
        await createMutation.mutateAsync(request);
        success("Cartão criado com sucesso");
      }
      onOpenChange(false);
    } catch (err) {
      const apiError = extractApiError(err);
      if (apiError?.errors?.length) {
        setFieldErrors(mapApiFieldErrors(apiError.errors));
        return;
      }
      const message = apiError?.detail ?? "Não foi possível salvar o cartão.";
      setGeneralError(message);
      error(message);
    }
  });

  const active = form.watch("active");
  const brand = form.watch("brand");
  const defaultPaymentAccountIdRaw = form.watch("defaultPaymentAccountId");

  const defaultPaymentAccountSelectValue = React.useMemo(() => {
    if (defaultPaymentAccountIdRaw == null || defaultPaymentAccountIdRaw === "") {
      return "__none__";
    }
    const normalized = String(defaultPaymentAccountIdRaw).trim();
    return normalized === "" ? "__none__" : normalized;
  }, [defaultPaymentAccountIdRaw]);

  return (
    <FormDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Editar cartão" : "Novo cartão"}
      description={
        isEdit
          ? "Atualize os dados de ciclo, limite e conta padrão para pagamento da fatura."
          : "Cadastre o cartão com bandeira, ciclo de fechamento/vencimento e limite."
      }
      generalError={generalError}
      contentClassName="max-w-2xl"
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="credit-card-form-name">Nome</Label>
            <Input
              id="credit-card-form-name"
              placeholder="Ex.: Cartão principal"
              autoComplete="off"
              className={cn(
                getInputErrorClass(fieldErrors.name ?? form.formState.errors.name?.message),
              )}
              {...form.register("name", {
                onChange: () => clearFieldError("name"),
              })}
            />
            <FormFieldError message={fieldErrors.name ?? form.formState.errors.name?.message} />
          </div>

          <div className="space-y-2">
            <Label>Bandeira</Label>
            <Select
              value={brand}
              disabled={isSubmitting}
              onValueChange={(value) => {
                form.setValue("brand", value as "VISA" | "MASTERCARD", {
                  shouldDirty: true,
                });
                clearFieldError("brand");
              }}
            >
              <SelectTrigger className={cn(getInputErrorClass(fieldErrors.brand))}>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VISA">Visa</SelectItem>
                <SelectItem value="MASTERCARD">Mastercard</SelectItem>
              </SelectContent>
            </Select>
            <FormFieldError message={fieldErrors.brand} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="credit-card-form-limit">Limite</Label>
            <MinorUnitMoneyInput
              id="credit-card-form-limit"
              placeholder="R$ 0,00"
              value={form.watch("creditLimit") || ""}
              onChange={(next) => {
                form.setValue("creditLimit", next, { shouldDirty: true });
                clearFieldError("creditLimit");
              }}
              onBlur={() => {
                void form.trigger("creditLimit");
              }}
              className={cn(
                getInputErrorClass(
                  fieldErrors.creditLimit ?? form.formState.errors.creditLimit?.message,
                ),
              )}
            />
            <FormFieldError
              message={fieldErrors.creditLimit ?? form.formState.errors.creditLimit?.message}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="credit-card-form-closing-day">Dia de fechamento</Label>
            <Input
              id="credit-card-form-closing-day"
              type="number"
              min={1}
              max={31}
              inputMode="numeric"
              className={cn(
                getInputErrorClass(
                  fieldErrors.closingDay ?? form.formState.errors.closingDay?.message,
                ),
              )}
              {...form.register("closingDay", {
                valueAsNumber: true,
                onChange: () => clearFieldError("closingDay"),
              })}
            />
            <FormFieldError
              message={fieldErrors.closingDay ?? form.formState.errors.closingDay?.message}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="credit-card-form-due-day">Dia de vencimento</Label>
            <Input
              id="credit-card-form-due-day"
              type="number"
              min={1}
              max={31}
              inputMode="numeric"
              className={cn(
                getInputErrorClass(fieldErrors.dueDay ?? form.formState.errors.dueDay?.message),
              )}
              {...form.register("dueDay", {
                valueAsNumber: true,
                onChange: () => clearFieldError("dueDay"),
              })}
            />
            <FormFieldError message={fieldErrors.dueDay ?? form.formState.errors.dueDay?.message} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Conta padrão de pagamento</Label>
            <Select
              value={defaultPaymentAccountSelectValue}
              disabled={isSubmitting}
              onValueChange={(value) => {
                form.setValue(
                  "defaultPaymentAccountId",
                  value === "__none__" ? "" : String(value).trim(),
                  { shouldDirty: true, shouldValidate: true },
                );
                clearFieldError("defaultPaymentAccountId");
              }}
            >
              <SelectTrigger
                className={cn(
                  "w-full min-w-0",
                  getInputErrorClass(fieldErrors.defaultPaymentAccountId),
                )}
              >
                <SelectValue placeholder="Selecione uma conta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Sem conta padrão</SelectItem>
                {accounts.map((account) => {
                  const accountId = String(account.id).trim();
                  return (
                    <SelectItem key={accountId} value={accountId}>
                      {account.name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <FormFieldError message={fieldErrors.defaultPaymentAccountId} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="credit-card-form-notes">Observações</Label>
            <textarea
              id="credit-card-form-notes"
              rows={3}
              placeholder="Opcional — observações internas sobre o cartão"
              autoComplete="off"
              className={cn(
                "flex min-h-[80px] w-full resize-y rounded-lg border bg-input px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                getInputErrorClass(
                  fieldErrors.notes ?? form.formState.errors.notes?.message,
                ),
              )}
              {...form.register("notes", {
                onChange: () => clearFieldError("notes"),
              })}
            />
            <FormFieldError message={fieldErrors.notes ?? form.formState.errors.notes?.message} />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <Label>Cartão ativo</Label>
              <p className="text-xs text-muted-foreground">
                {active
                  ? "Cartão disponível para lançamentos e seleção em filtros."
                  : "Cartão inativo permanece no histórico, mas não aparece nas seleções."}
              </p>
            </div>
            <Switch
              checked={active}
              disabled={isSubmitting}
              onCheckedChange={(checked) => {
                form.setValue("active", checked, { shouldDirty: true });
                clearFieldError("active");
              }}
              aria-label="Cartão ativo"
            />
          </div>
          <FormFieldError message={fieldErrors.active} />
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
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Salvando..."
              : isEdit
                ? "Salvar alterações"
                : "Criar cartão"}
          </Button>
        </DialogFooter>
      </form>
    </FormDialogShell>
  );
}
