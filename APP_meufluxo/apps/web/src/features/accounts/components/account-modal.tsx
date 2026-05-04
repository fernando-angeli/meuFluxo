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
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";

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

/** Tipos disponíveis ao criar conta (alinhados ao enum da API). */
const ALLOWED_ACCOUNT_TYPES: AccountType[] = [
  "CHECKING",
  "SAVING",
  "INVESTMENT",
  "CASH",
  "BENEFIT_CARD",
];

const accountTypeEnum = z.enum([
  "CHECKING",
  "CREDIT_CARD",
  "CASH",
  "INVESTMENT",
  "SAVING",
  "BENEFIT_CARD",
]);

function isValidAccountType(value: string): value is AccountType {
  return accountTypeEnum.safeParse(value).success;
}

const accountModalSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres."),
  accountType: z
    .string()
    .trim()
    .min(1, "Tipo da conta é obrigatório.")
    .refine((v) => isValidAccountType(v), "Tipo da conta inválido."),
  initialBalance: z
    .string()
    .trim()
    .refine((v) => {
      const n = parseMoneyInput((v ?? "").trim() || "0");
      return Number.isFinite(n) && n >= 0;
    }, "Saldo inicial não pode ser negativo."),
  initialBalanceDate: z
    .string()
    .trim()
    .min(1, "Data do saldo inicial é obrigatória.")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Informe uma data válida no formato YYYY-MM-DD."),
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

type AccountModalValues = {
  name: string;
  accountType: string;
  initialBalance: string;
  initialBalanceDate: string;
  active: boolean;
  bankCode: string;
  bankName: string;
  agency: string;
  accountNumber: string;
  overdraftLimit: string;
};

function todayIsoDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function accountBankPayload(values: AccountModalValues, accountType: AccountType) {
  if (accountType !== "CHECKING" && accountType !== "INVESTMENT") return {};
  return {
    bankCode: normalizeBankString(values.bankCode) || null,
    bankName: normalizeBankString(values.bankName) || null,
    agency: normalizeBankString(values.agency) || null,
    accountNumber: normalizeBankString(values.accountNumber) || null,
    ...(accountType === "CHECKING"
      ? { overdraftLimit: parseMoneyInput((values.overdraftLimit ?? "").trim() || "0") }
      : {}),
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
  const [impactConfirmOpen, setImpactConfirmOpen] = React.useState(false);
  const pendingSubmitValuesRef = React.useRef<AccountModalValues | null>(null);
  const initialAnchorRef = React.useRef<{ initialBalance: number; initialBalanceDate: string }>({
    initialBalance: 0,
    initialBalanceDate: todayIsoDate(),
  });

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
      accountType: "",
      initialBalance: "",
      initialBalanceDate: "",
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
        accountType: "",
        initialBalance: "",
        initialBalanceDate: "",
        active: true,
        ...emptyCheckingDefaults,
      });
      initialAnchorRef.current = {
        initialBalance: 0,
        initialBalanceDate: todayIsoDate(),
      };
      return;
    }

    if (detailsQuery.isSuccess && detailsQuery.data) {
      const d = detailsQuery.data;
      form.reset({
        name: d.name ?? "",
        accountType: d.accountType as AccountType,
        initialBalance: amountToEditString(d.initialBalance ?? 0, intlLocale),
        initialBalanceDate: d.initialBalanceDate?.slice(0, 10) ?? todayIsoDate(),
        active: !!d.meta.active,
        bankCode: normalizeBankString(d.bankCode),
        bankName: normalizeBankString(d.bankName),
        agency: normalizeBankString(d.agency),
        accountNumber: normalizeBankString(d.accountNumber),
        overdraftLimit: amountToEditString(d.overdraftLimit ?? 0, intlLocale),
      });
      initialAnchorRef.current = {
        initialBalance: Number.isFinite(d.initialBalance) ? d.initialBalance : 0,
        initialBalanceDate: d.initialBalanceDate?.slice(0, 10) ?? todayIsoDate(),
      };
      return;
    }

    form.reset({
      name: account.name ?? "",
      accountType: account.accountType as AccountType,
      initialBalance: amountToEditString(
        Number.isFinite(account.currentBalance) ? account.currentBalance : 0,
        intlLocale,
      ),
      initialBalanceDate: account.initialBalanceDate?.slice(0, 10) ?? todayIsoDate(),
      active: !!account.meta.active,
      bankCode: normalizeBankString(account.bankCode),
      bankName: normalizeBankString(account.bankName),
      agency: normalizeBankString(account.agency),
      accountNumber: normalizeBankString(account.accountNumber),
      overdraftLimit: amountToEditString(account.overdraftLimit ?? 0, intlLocale),
    });
    initialAnchorRef.current = {
      initialBalance: Number.isFinite(account.currentBalance) ? account.currentBalance : 0,
      initialBalanceDate: account.initialBalanceDate?.slice(0, 10) ?? todayIsoDate(),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset só quando abre / conta / detalhes carregados
  }, [open, account?.id, detailsQuery.isSuccess, detailsQuery.data, intlLocale]);

  const submitAccount = React.useCallback(async (values: AccountModalValues) => {
    setFieldErrors({});
    setGeneralError(null);
    if (!isValidAccountType(values.accountType)) {
      form.setError("accountType", { message: "Tipo da conta é obrigatório." });
      return;
    }

    try {
      if (isEdit) {
        const accountType = values.accountType as AccountType;
        await updateMutation.mutateAsync({
          id: account!.id,
          request: {
            name: values.name,
            active: values.active,
            initialBalance: parseMoneyInput((values.initialBalance ?? "").trim() || "0"),
            initialBalanceDate: values.initialBalanceDate,
            ...accountBankPayload(values, accountType),
          },
        });
        success("Conta atualizada com sucesso");
      } else {
        const accountType = values.accountType as AccountType;
        const created = await createMutation.mutateAsync({
          name: values.name,
          accountType,
          initialBalance: parseMoneyInput((values.initialBalance ?? "").trim() || "0"),
          initialBalanceDate: values.initialBalanceDate,
          ...accountBankPayload(values, accountType),
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
  }, [
    account,
    createMutation,
    error,
    form,
    isEdit,
    onOpenChange,
    success,
    updateMutation,
  ]);

  const onSubmit = form.handleSubmit(async (values) => {
    if (isEdit) {
      const nextBalance = parseMoneyInput((values.initialBalance ?? "").trim() || "0");
      const prevBalance = initialAnchorRef.current.initialBalance;
      const nextDate = values.initialBalanceDate.slice(0, 10);
      const prevDate = initialAnchorRef.current.initialBalanceDate.slice(0, 10);
      const anchorChanged = Math.abs(nextBalance - prevBalance) > 0.000001 || nextDate !== prevDate;
      if (anchorChanged) {
        pendingSubmitValuesRef.current = values;
        setImpactConfirmOpen(true);
        return;
      }
    }
    await submitAccount(values);
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const options = React.useMemo(() => {
    const set = new Set<AccountType>(ALLOWED_ACCOUNT_TYPES);
    if (isValidAccountType(currentAccountType) && !set.has(currentAccountType)) {
      set.add(currentAccountType);
    }
    return Array.from(set);
  }, [currentAccountType]);

  const bankCodeRaw = form.watch("bankCode");
  const bankNameRaw = form.watch("bankName");
  const bankCode = normalizeBankString(bankCodeRaw);
  const bankName = normalizeBankString(bankNameRaw);

  return (
    <>
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

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select
              value={currentAccountType || "__none__"}
              disabled={isEdit || isSubmitting}
              onValueChange={(value) => {
                form.setValue("accountType", value === "__none__" ? "" : value, { shouldDirty: true });
                clearFieldError("accountType");
              }}
            >
              <SelectTrigger className={cn("h-10 w-full", getInputErrorClass(fieldErrors.accountType))}>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Selecione o tipo</SelectItem>
                {options.map((t) => (
                  <SelectItem key={t} value={t}>
                    {getAccountTypeLabel(t)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormFieldError message={fieldErrors.accountType ?? form.formState.errors.accountType?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="initialBalance">Saldo inicial</Label>
            <ControlledMinorUnitMoneyInput
              id="initialBalance"
              control={form.control}
              name="initialBalance"
              disabled={isSubmitting}
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
            <p className="text-xs text-muted-foreground">
              Pode ficar em branco ou R$ 0,00 se o saldo for zero no cadastro.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="initialBalanceDate">Data do saldo inicial</Label>
            <Input
              id="initialBalanceDate"
              type="date"
              disabled={isSubmitting}
              className={cn(
                "h-10",
                getInputErrorClass(
                  fieldErrors.initialBalanceDate ?? form.formState.errors.initialBalanceDate?.message,
                ),
              )}
              {...form.register("initialBalanceDate", {
                onChange: () => clearFieldError("initialBalanceDate"),
              })}
            />
            <FormFieldError
              message={fieldErrors.initialBalanceDate ?? form.formState.errors.initialBalanceDate?.message}
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Lançamentos com vencimento menor ou igual a essa data são bloqueados para preservar a
          referência do saldo inicial.
        </p>

        {currentAccountType === "CHECKING" || currentAccountType === "INVESTMENT" ? (
          <div className="space-y-4 rounded-xl border border-border/80 bg-muted/20 p-4 dark:bg-muted/10">
            <p className="text-sm font-medium text-foreground">
              {currentAccountType === "CHECKING" ? "Conta corrente" : "Dados bancários do investimento"}
            </p>
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
              {currentAccountType === "CHECKING" ? (
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
                  <p className="text-xs text-muted-foreground">
                    Pode ficar em branco ou R$ 0,00 se não houver cheque especial.
                  </p>
                </div>
              ) : null}
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
    <ConfirmDialog
      open={impactConfirmOpen}
      onOpenChange={setImpactConfirmOpen}
      title="Alterar saldo/data inicial da conta?"
      description="Essa alteração impacta todo o histórico e recalcula os saldos finais dos lançamentos posteriores. Deseja continuar?"
      cancelText="Cancelar"
      confirmText="Sim, recalcular saldos"
      confirmVariant="destructive"
      isConfirming={isSubmitting}
      onConfirm={async () => {
        const pending = pendingSubmitValuesRef.current;
        if (!pending) return;
        await submitAccount(pending);
      }}
    />
    </>
  );
}
