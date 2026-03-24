"use client";

import * as React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import type { Account, AccountType } from "@meufluxo/types";
import { getAccountTypeLabel } from "@meufluxo/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { FormFieldError } from "@/components/form";
import { FormDialogShell } from "@/components/patterns";
import { useToast } from "@/components/toast";
import { extractApiError, getInputErrorClass, mapApiFieldErrors } from "@/lib/api-error";
import { cn } from "@/lib/utils";
import { useCreateAccount, useUpdateAccount } from "@/hooks/api";

const ALLOWED_ACCOUNT_TYPES: AccountType[] = ["CHECKING", "CASH", "INVESTMENT"];

const accountTypeEnum = z.enum([
  "CHECKING",
  "CREDIT_CARD",
  "CASH",
  "INVESTMENT",
  "SAVING",
  "BENEFIT_CARD",
]);

const accountModalSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres."),
  accountType: accountTypeEnum,
  initialBalance: z.number().min(0, "Saldo inicial não pode ser negativo."),
  active: z.boolean(),
});

type AccountModalValues = z.infer<typeof accountModalSchema>;

export function AccountModal({
  open,
  onOpenChange,
  account,
  currency,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: Account | null;
  currency: "BRL" | "USD" | "EUR";
}) {
  const { success, error } = useToast();
  const createMutation = useCreateAccount();
  const updateMutation = useUpdateAccount();

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

  const isEdit = !!account;

  const form = useForm<AccountModalValues>({
    resolver: zodResolver(accountModalSchema),
    defaultValues: {
      name: "",
      accountType: "CHECKING",
      initialBalance: 0,
      active: true,
    },
  });

  const active = form.watch("active");
  const currentAccountType = form.watch("accountType");

  React.useEffect(() => {
    if (!open) return;

    setFieldErrors({});
    setGeneralError(null);

    if (account) {
      form.reset({
        name: account.name ?? "",
        accountType: account.accountType as AccountType,
        initialBalance: account.currentBalance ?? 0,
        active: !!account.meta.active,
      });
    } else {
      form.reset({
        name: "",
        accountType: "CHECKING",
        initialBalance: 0,
        active: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, account?.id]);

  const onSubmit = form.handleSubmit(async (values) => {
    setFieldErrors({});
    setGeneralError(null);

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({
          id: account!.id,
          request: { name: values.name, active: values.active },
        });
        success("Conta atualizada com sucesso");
      } else {
        const created = await createMutation.mutateAsync({
          name: values.name,
          accountType: values.accountType,
          initialBalance: values.initialBalance,
        });
        // Backend não recebe `active` no create, então aplicamos via update quando necessário.
        if (!values.active) {
          await updateMutation.mutateAsync({
            id: created.id,
            request: { name: values.name, active: values.active },
          });
        }
        success("Conta criada com sucesso");
      }
      onOpenChange(false);
    } catch (err) {
      const apiError = extractApiError(err);

      if (apiError?.errors?.length) {
        setFieldErrors(mapApiFieldErrors(apiError.errors));
      } else {
        const message = apiError?.detail ?? "Ocorreu um erro ao salvar.";
        setGeneralError(message);
        error(message);
      }
    }
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const options = React.useMemo(() => {
    const set = new Set<AccountType>(ALLOWED_ACCOUNT_TYPES);
    if (!set.has(currentAccountType)) set.add(currentAccountType);
    return Array.from(set);
  }, [currentAccountType]);

  const currencySymbol = React.useMemo(() => {
    try {
      const parts = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency,
      }).formatToParts(0);
      return (
        parts.find((p) => p.type === "currency")?.value ?? (currency === "BRL" ? "R$" : currency)
      );
    } catch {
      return currency === "BRL" ? "R$" : currency;
    }
  }, [currency]);

  return (
    <FormDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Editar conta" : "Nova conta"}
      description="Atualize os dados principais da conta."
      generalError={generalError}
      contentClassName="max-w-xl"
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            placeholder="Ex.: Nubank"
            className={cn(
              getInputErrorClass(fieldErrors.name ?? form.formState.errors.name?.message),
            )}
            {...form.register("name", {
              onChange: () => clearFieldError("name"),
            })}
          />
          <FormFieldError message={fieldErrors.name ?? form.formState.errors.name?.message} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select
              value={currentAccountType}
              disabled={isEdit || isSubmitting}
              onValueChange={(value) => {
                form.setValue("accountType", value as AccountType, {
                  shouldDirty: true,
                });
                clearFieldError("accountType");
              }}
            >
              <SelectTrigger className={cn("h-10", getInputErrorClass(fieldErrors.accountType))}>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {options.map((t) => (
                  <SelectItem key={t} value={t}>
                    {getAccountTypeLabel(t)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormFieldError message={fieldErrors.accountType} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="initialBalance">Saldo inicial</Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                {currencySymbol}
              </span>
              <Input
                id="initialBalance"
                type="number"
                step="0.01"
                disabled={isEdit || isSubmitting}
                placeholder="0,00"
                className={cn(
                  "pl-10 h-10",
                  getInputErrorClass(
                    fieldErrors.initialBalance ?? form.formState.errors.initialBalance?.message,
                  ),
                )}
                {...form.register("initialBalance", {
                  valueAsNumber: true,
                  onChange: () => clearFieldError("initialBalance"),
                })}
              />
            </div>
            <FormFieldError
              message={fieldErrors.initialBalance ?? form.formState.errors.initialBalance?.message}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <Label>Conta ativa</Label>
              <p className="text-xs text-muted-foreground">
                {active
                  ? "A conta está visível nas seleções."
                  : "A inativação não remove movimentações já cadastradas."}
              </p>
            </div>

            <Switch
              checked={active}
              disabled={isSubmitting}
              onCheckedChange={(checked) => {
                form.setValue("active", checked);
                clearFieldError("active");
              }}
              aria-label="Conta ativa"
            />
          </div>
          <FormFieldError message={fieldErrors.active} />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : isEdit ? "Salvar alterações" : "Criar conta"}
          </Button>
        </DialogFooter>
      </form>
    </FormDialogShell>
  );
}
