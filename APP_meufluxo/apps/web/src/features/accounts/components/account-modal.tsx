"use client";

import * as React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import type { Account, AccountType } from "@meufluxo/types";
import { getAccountTypeLabel } from "@meufluxo/types";
import { amountToEditString, intlLocaleFromAppLocale, parseMoneyInput } from "@meufluxo/utils";
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
import { ControlledMinorUnitMoneyInput } from "@/components/form/controlled-minor-unit-money-input";
import { FormDialogShell } from "@/components/patterns";
import { useToast } from "@/components/toast";
import { extractApiError, getInputErrorClass, mapApiFieldErrors } from "@/lib/api-error";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/i18n";
import { useAccountDetails, useCreateAccount, useUpdateAccount } from "@/hooks/api";

import { normalizeBankString } from "@/features/accounts/lib/normalize-bank-fields";

import { BankSelect } from "./bank-select";

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
  initialBalance: z
    .string()
    .refine((v) => {
      const n = parseMoneyInput((v ?? "").trim() || "0");
      return Number.isFinite(n) && n >= 0;
    }, "Saldo inicial não pode ser negativo."),
  active: z.boolean(),
  bankCode: z.string(),
  bankName: z.string(),
  agency: z.string(),
  accountNumber: z.string(),
  overdraftLimit: z
    .string()
    .refine((v) => {
      const n = parseMoneyInput((v ?? "").trim() || "0");
      return Number.isFinite(n) && n >= 0;
    }, "Limite não pode ser negativo."),
});

type AccountModalValues = z.infer<typeof accountModalSchema>;

function checkingPayload(values: AccountModalValues, accountType: AccountType) {
  if (accountType !== "CHECKING") return {};
  return {
    bankCode: normalizeBankString(values.bankCode) || null,
    bankName: normalizeBankString(values.bankName) || null,
    agency: normalizeBankString(values.agency) || null,
    accountNumber: normalizeBankString(values.accountNumber) || null,
    overdraftLimit: parseMoneyInput((values.overdraftLimit ?? "").trim() || "0"),
  };
}

const emptyCheckingDefaults = {
  bankCode: "",
  bankName: "",
  agency: "",
  accountNumber: "",
  overdraftLimit: "",
};

export function AccountModal({
  open,
  onOpenChange,
  account,
  currency: _currency,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: Account | null;
  currency: "BRL" | "USD" | "EUR";
}) {
  const { success, error } = useToast();
  const { locale: appLocale } = useLocale();
  const intlLocale = intlLocaleFromAppLocale(appLocale);
  const createMutation = useCreateAccount();
  const updateMutation = useUpdateAccount();

  const isEdit = !!account;
  const detailsQuery = useAccountDetails(account?.id ?? null, open && isEdit);

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

  const form = useForm<AccountModalValues>({
    resolver: zodResolver(accountModalSchema),
    defaultValues: {
      name: "",
      accountType: "CHECKING",
      initialBalance: "",
      active: true,
      ...emptyCheckingDefaults,
    },
  });

  const active = form.watch("active");
  const currentAccountType = form.watch("accountType");

  React.useEffect(() => {
    if (!open) return;

    setFieldErrors({});
    setGeneralError(null);

    if (!account) {
      form.reset({
        name: "",
        accountType: "CHECKING",
        initialBalance: "",
        active: true,
        ...emptyCheckingDefaults,
      });
      return;
    }

    if (detailsQuery.isSuccess && detailsQuery.data) {
      const d = detailsQuery.data;
      form.reset({
        name: d.name ?? "",
        accountType: d.accountType as AccountType,
        initialBalance:
          (d.initialBalance ?? 0) > 0 ? amountToEditString(d.initialBalance ?? 0, intlLocale) : "",
        active: !!d.meta.active,
        bankCode: normalizeBankString(d.bankCode),
        bankName: normalizeBankString(d.bankName),
        agency: normalizeBankString(d.agency),
        accountNumber: normalizeBankString(d.accountNumber),
        overdraftLimit:
          (d.overdraftLimit ?? 0) > 0 ? amountToEditString(d.overdraftLimit ?? 0, intlLocale) : "",
      });
      return;
    }

    form.reset({
      name: account.name ?? "",
      accountType: account.accountType as AccountType,
      initialBalance:
        (account.currentBalance ?? 0) > 0
          ? amountToEditString(account.currentBalance ?? 0, intlLocale)
          : "",
      active: !!account.meta.active,
      bankCode: normalizeBankString(account.bankCode),
      bankName: normalizeBankString(account.bankName),
      agency: normalizeBankString(account.agency),
      accountNumber: normalizeBankString(account.accountNumber),
      overdraftLimit:
        (account.overdraftLimit ?? 0) > 0
          ? amountToEditString(account.overdraftLimit ?? 0, intlLocale)
          : "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset só quando abre / conta / detalhes carregados
  }, [open, account?.id, detailsQuery.isSuccess, detailsQuery.data, intlLocale]);

  const onSubmit = form.handleSubmit(async (values) => {
    setFieldErrors({});
    setGeneralError(null);

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({
          id: account!.id,
          request: {
            name: values.name,
            active: values.active,
            ...checkingPayload(values, account!.accountType),
          },
        });
        success("Conta atualizada com sucesso");
      } else {
        const created = await createMutation.mutateAsync({
          name: values.name,
          accountType: values.accountType,
          initialBalance: parseMoneyInput((values.initialBalance ?? "").trim() || "0"),
          ...checkingPayload(values, values.accountType),
        });
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

  const bankCodeRaw = form.watch("bankCode");
  const bankNameRaw = form.watch("bankName");
  const bankCode = normalizeBankString(bankCodeRaw);
  const bankName = normalizeBankString(bankNameRaw);

  return (
    <FormDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Editar conta" : "Nova conta"}
      description="Atualize os dados principais da conta."
      generalError={generalError}
      contentClassName="max-w-2xl"
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
            <ControlledMinorUnitMoneyInput
              id="initialBalance"
              control={form.control}
              name="initialBalance"
              disabled={isEdit || isSubmitting}
              className={cn(
                "h-10 w-full",
                getInputErrorClass(
                  fieldErrors.initialBalance ?? form.formState.errors.initialBalance?.message,
                ),
              )}
              aria-invalid={!!(fieldErrors.initialBalance ?? form.formState.errors.initialBalance)}
              onMoneyBlur={() => clearFieldError("initialBalance")}
            />
            <FormFieldError
              message={fieldErrors.initialBalance ?? form.formState.errors.initialBalance?.message}
            />
          </div>
        </div>

        {currentAccountType === "CHECKING" ? (
          <div className="space-y-4 rounded-xl border border-border/80 bg-muted/20 p-4 dark:bg-muted/10">
            <p className="text-sm font-medium text-foreground">Conta corrente</p>
            <div className="grid gap-4 md:grid-cols-2">
              <BankSelect
                id="account-bank"
                value={bankCode && bankName ? { code: bankCode, name: bankName } : null}
                onChange={(b) => {
                  if (!b) {
                    form.setValue("bankCode", "", { shouldDirty: true });
                    form.setValue("bankName", "", { shouldDirty: true });
                  } else {
                    form.setValue("bankCode", b.code, { shouldDirty: true });
                    form.setValue("bankName", b.name, { shouldDirty: true });
                  }
                  clearFieldError("bankCode");
                  clearFieldError("bankName");
                }}
                disabled={isSubmitting}
                error={!!fieldErrors.bankCode || !!fieldErrors.bankName}
                enabled={open && currentAccountType === "CHECKING"}
              />
              <div className="space-y-2">
                <Label htmlFor="agency">Agência</Label>
                <Input
                  id="agency"
                  placeholder="Ex.: 1234"
                  autoComplete="off"
                  className={cn("h-10", getInputErrorClass(fieldErrors.agency))}
                  {...form.register("agency", {
                    onChange: () => clearFieldError("agency"),
                  })}
                />
                <FormFieldError message={fieldErrors.agency} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Conta</Label>
                <Input
                  id="accountNumber"
                  placeholder="Ex.: 12345-6"
                  autoComplete="off"
                  className={cn("h-10", getInputErrorClass(fieldErrors.accountNumber))}
                  {...form.register("accountNumber", {
                    onChange: () => clearFieldError("accountNumber"),
                  })}
                />
                <FormFieldError message={fieldErrors.accountNumber} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="overdraftLimit">Limite (cheque especial)</Label>
                <ControlledMinorUnitMoneyInput
                  id="overdraftLimit"
                  control={form.control}
                  name="overdraftLimit"
                  disabled={isSubmitting}
                  className={cn(
                    "h-10 w-full",
                    getInputErrorClass(
                      fieldErrors.overdraftLimit ?? form.formState.errors.overdraftLimit?.message,
                    ),
                  )}
                  aria-invalid={!!(fieldErrors.overdraftLimit ?? form.formState.errors.overdraftLimit)}
                  onMoneyBlur={() => clearFieldError("overdraftLimit")}
                />
                <FormFieldError
                  message={
                    fieldErrors.overdraftLimit ?? form.formState.errors.overdraftLimit?.message
                  }
                />
              </div>
            </div>
          </div>
        ) : null}

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
