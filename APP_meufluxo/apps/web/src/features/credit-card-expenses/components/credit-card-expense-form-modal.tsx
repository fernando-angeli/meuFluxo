"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { parseMoneyInput, formatCurrency } from "@meufluxo/utils";
import type { CreditCardExpense } from "@meufluxo/types";

import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FilterSelect } from "@/components/filters";
import { FormFieldError } from "@/components/form";
import { FormDialogShell } from "@/components/patterns";
import { MinorUnitMoneyInput } from "@/components/ui/minor-unit-money-input";
import { ExpenseFormDateField } from "@/features/expenses/components/expense-form-date-field";
import {
  useCreateCreditCardExpense,
  useUpdateCreditCardExpense,
} from "@/hooks/api";
import {
  extractApiError,
  getInputErrorClass,
  mapApiFieldErrors,
} from "@/lib/api-error";
import { toNumericId } from "@/lib/numeric-id";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/toast";

import {
  creditCardExpenseFormSchema,
  type CreditCardExpenseFormValues,
} from "../credit-card-expense-form.schema";

export function CreditCardExpenseFormModal({
  open,
  onOpenChange,
  expense,
  creditCards,
  forcedCreditCardId,
  categories,
  subCategories,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: CreditCardExpense | null;
  creditCards: Array<{ id: string; name: string }>;
  forcedCreditCardId?: string | number | null;
  categories: Array<{ id: string; name: string; movementType?: string }>;
  subCategories: Array<{ id: string; name: string; categoryId: string }>;
  onSaved: () => void;
}) {
  const { success, error } = useToast();
  const createMutation = useCreateCreditCardExpense();
  const updateMutation = useUpdateCreditCardExpense();

  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [generalError, setGeneralError] = React.useState<string | null>(null);

  const isEdit = !!expense;
  const cardOptions = React.useMemo(
    () =>
      creditCards
        .map((card) => {
          const id = toNumericId(card.id);
          if (id == null) return null;
          return { value: String(id), label: card.name, id };
        })
        .filter((item): item is { value: string; label: string; id: number } => item != null),
    [creditCards],
  );

  const categoryOptions = React.useMemo(
    () =>
      categories
        .filter((category) => category.movementType !== "INCOME")
        .map((category) => {
          const id = toNumericId(category.id);
          if (id == null) return null;
          return { value: String(id), label: category.name, id };
        })
        .filter((item): item is { value: string; label: string; id: number } => item != null),
    [categories],
  );

  const forcedCreditCardNumericId = toNumericId(forcedCreditCardId);
  const isCardFixed = forcedCreditCardNumericId != null;
  /** Cartão já definido pelo contexto (ex.: visão gerencial) — não exibir campo. */
  const hideCardField = isCardFixed;
  const singleCreditCardId = cardOptions.length === 1 ? cardOptions[0].id : null;

  const form = useForm<CreditCardExpenseFormValues>({
    resolver: zodResolver(creditCardExpenseFormSchema),
    defaultValues: {
      creditCardId: null,
      description: "",
      purchaseDate: "",
      categoryId: null,
      subcategoryId: null,
      totalAmount: "",
      entryType: "SINGLE",
      installmentCount: 2,
      notes: "",
    },
  });

  const selectedCategoryId = form.watch("categoryId");
  const entryType = form.watch("entryType");
  const installmentCount = form.watch("installmentCount");
  const totalAmountValue = form.watch("totalAmount");

  const availableSubCategories = React.useMemo(() => {
    if (!selectedCategoryId) return [];
    return subCategories
      .map((item) => {
        const id = toNumericId(item.id);
        const categoryId = toNumericId(item.categoryId);
        if (id == null || categoryId == null) return null;
        return { value: String(id), label: item.name, id, categoryId };
      })
      .filter((item): item is { value: string; label: string; id: number; categoryId: number } => item != null)
      .filter((item) => item.categoryId === selectedCategoryId);
  }, [selectedCategoryId, subCategories]);

  React.useEffect(() => {
    if (!open) return;
    setFieldErrors({});
    setGeneralError(null);

    if (expense) {
      const expenseCreditCardId = toNumericId(expense.creditCardId);
      const expenseCategoryId = toNumericId(expense.categoryId);
      const expenseSubcategoryId = toNumericId(expense.subCategoryId);
      form.reset({
        creditCardId: forcedCreditCardNumericId ?? expenseCreditCardId,
        description: expense.description,
        purchaseDate: expense.purchaseDate,
        categoryId: expenseCategoryId,
        subcategoryId: expenseSubcategoryId,
        totalAmount: String(expense.totalAmount),
        entryType: expense.entryType,
        installmentCount: Math.max(1, expense.installmentCount || 1),
        notes: expense.notes ?? "",
      });
      return;
    }

    form.reset({
      creditCardId: forcedCreditCardNumericId ?? singleCreditCardId,
      description: "",
      purchaseDate: "",
      categoryId: null,
      subcategoryId: null,
      totalAmount: "",
      entryType: "SINGLE",
      installmentCount: 2,
      notes: "",
    });
  }, [open, expense, form, singleCreditCardId, forcedCreditCardNumericId]);

  React.useEffect(() => {
    if (!open || isEdit) return;
    if (forcedCreditCardNumericId) {
      form.setValue("creditCardId", forcedCreditCardNumericId, { shouldDirty: false });
      return;
    }
    if (!singleCreditCardId) return;
    if (form.getValues("creditCardId")) return;
    form.setValue("creditCardId", singleCreditCardId, { shouldDirty: false });
  }, [form, isEdit, open, singleCreditCardId, forcedCreditCardNumericId]);

  React.useEffect(() => {
    const currentSubCategory = form.getValues("subcategoryId");
    if (!currentSubCategory) return;
    const stillValid = availableSubCategories.some((item) => item.id === currentSubCategory);
    if (!stillValid) {
      form.setValue("subcategoryId", null);
    }
  }, [availableSubCategories, form]);

  React.useEffect(() => {
    if (entryType === "INSTALLMENT") return;
    form.clearErrors("installmentCount");
  }, [entryType, form]);

  const parsedTotalAmount = React.useMemo(
    () => parseMoneyInput(totalAmountValue || ""),
    [totalAmountValue],
  );
  const installmentEstimate =
    entryType === "INSTALLMENT" && installmentCount > 0
      ? parsedTotalAmount / installmentCount
      : 0;

  const clearFieldError = React.useCallback((field: string) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const onSubmit = form.handleSubmit(async (values) => {
    setFieldErrors({});
    setGeneralError(null);
    const creditCardId = Number(values.creditCardId ?? forcedCreditCardNumericId);
    if (!Number.isFinite(creditCardId) || creditCardId <= 0) {
      form.setError("creditCardId", { message: "Selecione o cartão." });
      return;
    }

    const installmentCountForApi =
      values.entryType === "INSTALLMENT"
        ? Math.max(2, Number(values.installmentCount) || 2)
        : 1;

    const createPayload = {
      creditCardId,
      description: values.description.trim(),
      purchaseDate: values.purchaseDate,
      categoryId: Number(values.categoryId),
      subcategoryId: values.subcategoryId ? Number(values.subcategoryId) : null,
      totalAmount: Number(parseMoneyInput(values.totalAmount)),
      installmentCount: installmentCountForApi,
      notes: values.notes?.trim() ? values.notes.trim() : null,
    } as const;

    const updatePayload = {
      description: values.description.trim(),
      purchaseDate: values.purchaseDate,
      categoryId: Number(values.categoryId),
      subcategoryId: values.subcategoryId ? Number(values.subcategoryId) : null,
      amount: Number(parseMoneyInput(values.totalAmount)),
      notes: values.notes?.trim() ? values.notes.trim() : null,
    } as const;

    try {
      if (isEdit && expense) {
        await updateMutation.mutateAsync({
          id: expense.id,
          request: updatePayload,
        });
        success("Despesa no cartão atualizada com sucesso.");
      } else {
        await createMutation.mutateAsync(createPayload);
        success("Despesa no cartão criada com sucesso.");
      }
      onOpenChange(false);
      onSaved();
    } catch (err) {
      const apiError = extractApiError(err);
      if (apiError?.errors?.length) {
        setFieldErrors(mapApiFieldErrors(apiError.errors));
      } else {
        const message =
          apiError?.detail ?? "Não foi possível salvar a despesa no cartão.";
        setGeneralError(message);
        error(message);
      }
    }
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <FormDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Editar despesa no cartão" : "Nova despesa no cartão"}
      description={
        hideCardField
          ? "Registre a compra neste cartão com suporte a lançamento único ou parcelado."
          : "Registre compras no cartão com suporte a lançamento único ou parcelado."
      }
      generalError={generalError}
      contentClassName="max-w-2xl"
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        {!hideCardField ? (
          <div className="space-y-2">
            <Label htmlFor="credit-card-expense-card">Cartão</Label>
            <FilterSelect
              id="credit-card-expense-card"
              value={form.watch("creditCardId") ? String(form.watch("creditCardId")) : ""}
              onChange={(value) => {
                form.setValue("creditCardId", toNumericId(value), { shouldDirty: true });
                clearFieldError("creditCardId");
              }}
              options={cardOptions}
              placeholder="Selecione o cartão"
              triggerClassName={cn("h-10", getInputErrorClass(fieldErrors.creditCardId))}
            />
            <FormFieldError message={fieldErrors.creditCardId ?? form.formState.errors.creditCardId?.message} />
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="credit-card-expense-description">Descrição</Label>
          <Input
            id="credit-card-expense-description"
            maxLength={100}
            className={getInputErrorClass(fieldErrors.description ?? form.formState.errors.description?.message)}
            {...form.register("description", {
              onChange: () => clearFieldError("description"),
            })}
          />
          <FormFieldError message={fieldErrors.description ?? form.formState.errors.description?.message} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="credit-card-expense-category">Categoria</Label>
            <FilterSelect
              id="credit-card-expense-category"
            value={form.watch("categoryId") ? String(form.watch("categoryId")) : ""}
              onChange={(value) => {
              form.setValue("categoryId", toNumericId(value), { shouldDirty: true });
              form.setValue("subcategoryId", null);
                clearFieldError("categoryId");
              }}
            options={categoryOptions}
              placeholder="Selecione a categoria"
              triggerClassName={cn("h-10", getInputErrorClass(fieldErrors.categoryId))}
            />
            <FormFieldError message={fieldErrors.categoryId ?? form.formState.errors.categoryId?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="credit-card-expense-subcategory">Subcategoria</Label>
            <FilterSelect
              id="credit-card-expense-subcategory"
            value={form.watch("subcategoryId") ? String(form.watch("subcategoryId")) : ""}
              onChange={(value) => {
              form.setValue("subcategoryId", toNumericId(value), { shouldDirty: true });
              clearFieldError("subcategoryId");
              }}
              options={[
                { value: "", label: "Sem subcategoria" },
                ...availableSubCategories.map((subCategory) => ({
                value: subCategory.value,
                label: subCategory.label,
                })),
              ]}
              placeholder="Selecione a subcategoria"
              disabled={!selectedCategoryId}
            triggerClassName={cn("h-10", getInputErrorClass(fieldErrors.subcategoryId))}
            />
          <FormFieldError
            message={fieldErrors.subcategoryId ?? form.formState.errors.subcategoryId?.message}
          />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="credit-card-expense-purchase-date">Data da compra</Label>
            <ExpenseFormDateField
              control={form.control}
              name="purchaseDate"
              id="credit-card-expense-purchase-date"
              inputName="credit_card_expense_purchase_date"
              className="h-10 text-center"
              placeholder="dd/mm/aaaa"
              fillTodayOnBlurIfEmpty
              aria-invalid={
                !!(fieldErrors.purchaseDate ?? form.formState.errors.purchaseDate?.message)
              }
              calendarButtonAriaLabel="Abrir calendário da compra"
            />
            <FormFieldError message={fieldErrors.purchaseDate ?? form.formState.errors.purchaseDate?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="credit-card-expense-total-amount">Valor total da compra</Label>
            <Controller
              control={form.control}
              name="totalAmount"
              render={({ field }) => (
                <MinorUnitMoneyInput
                  id="credit-card-expense-total-amount"
                  className={cn(
                    "h-10",
                    getInputErrorClass(fieldErrors.totalAmount ?? form.formState.errors.totalAmount?.message),
                  )}
                  value={field.value ?? ""}
                  onChange={(next) => {
                    field.onChange(next);
                    clearFieldError("totalAmount");
                  }}
                />
              )}
            />
            <FormFieldError message={fieldErrors.totalAmount ?? form.formState.errors.totalAmount?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="credit-card-expense-entry-type">Tipo</Label>
            <FilterSelect<"SINGLE" | "INSTALLMENT">
              id="credit-card-expense-entry-type"
              value={entryType}
              onChange={(value) => {
                form.setValue("entryType", value, { shouldDirty: true });
                clearFieldError("entryType");
              }}
              options={[
                { value: "SINGLE", label: "Único" },
                { value: "INSTALLMENT", label: "Parcelado" },
              ]}
              placeholder="Selecione o tipo"
              triggerClassName={cn("h-10", getInputErrorClass(fieldErrors.entryType))}
            />
            <FormFieldError message={fieldErrors.entryType ?? form.formState.errors.entryType?.message} />
          </div>
        </div>

        {
          entryType === "INSTALLMENT" && (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2 col-span-1">
                <Label htmlFor="credit-card-expense-installment-count">Quantidade de parcelas</Label>
                <Input
                  id="credit-card-expense-installment-count"
                  type="number"
                  min={2}
                  max={99}
                  disabled={entryType !== "INSTALLMENT"}
                  className={cn(
                    "h-10",
                    getInputErrorClass(
                      fieldErrors.installmentCount ?? form.formState.errors.installmentCount?.message,
                    ),
                  )}
                  {...form.register("installmentCount", {
                    valueAsNumber: true,
                    onChange: () => clearFieldError("installmentCount"),
                  })}
                />
                <FormFieldError
                  message={fieldErrors.installmentCount ?? form.formState.errors.installmentCount?.message}
                />
              </div>
                
              <p className="text-xs text-muted-foreground col-span-2 vertical-text-center">
                Serão geradas {installmentCount || 0} parcelas
                {installmentEstimate > 0
                  ? ` de ${formatCurrency(installmentEstimate, "BRL")} (valor estimado).`
                  : "."}
              </p>
            </div>
          )
        }

        <div className="space-y-2">
          <Label htmlFor="credit-card-expense-notes">Observações</Label>
          <textarea
            id="credit-card-expense-notes"
            maxLength={250}
            className={cn(
              "h-20 w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm",
              getInputErrorClass(fieldErrors.notes ?? form.formState.errors.notes?.message),
            )}
            {...form.register("notes", {
              onChange: () => clearFieldError("notes"),
            })}
          />
          <FormFieldError message={fieldErrors.notes ?? form.formState.errors.notes?.message} />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : isEdit ? "Salvar alterações" : "Criar lançamento"}
          </Button>
        </DialogFooter>
      </form>
    </FormDialogShell>
  );
}
