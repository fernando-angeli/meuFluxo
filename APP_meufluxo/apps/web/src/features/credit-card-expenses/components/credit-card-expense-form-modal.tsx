"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import type { CreditCardExpense } from "@meufluxo/types";
import { amountToEditString, formatCurrency, parseMoneyInput } from "@meufluxo/utils";

import { FormFieldError } from "@/components/form";
import { FormDialogShell } from "@/components/patterns";
import { useToast } from "@/components/toast";
import { SegmentedControl } from "@/components/ui/segmented-control";
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
import {
  useCategories,
  useCreateCreditCardExpense,
  useCreditCards,
  useSubCategories,
  useUpdateCreditCardExpense,
} from "@/hooks/api";
import { useAuthOptional } from "@/hooks/useAuth";
import { extractApiError, getInputErrorClass, mapApiFieldErrors } from "@/lib/api-error";
import { cn } from "@/lib/utils";
import { ExpenseFormDateField } from "@/features/expenses/components/expense-form-date-field";

import {
  creditCardExpenseFormSchema,
  type CreditCardExpenseFormValues,
} from "@/features/credit-card-expenses/credit-card-expense-form.schema";

function toIsoDate(value: Date) {
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, "0");
  const d = String(value.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function CreditCardExpenseFormModal({
  open,
  onOpenChange,
  expense,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: CreditCardExpense | null;
}) {
  const isEdit = !!expense;
  const { success, error } = useToast();
  const auth = useAuthOptional();
  const { data: creditCards = [] } = useCreditCards();
  const { data: categories = [] } = useCategories({ realOnly: true });
  const { data: subCategories = [] } = useSubCategories({ realOnly: true });
  const createMutation = useCreateCreditCardExpense();
  const updateMutation = useUpdateCreditCardExpense();
  const currency = (auth?.preferences?.currency as "BRL" | "USD" | "EUR") ?? "BRL";

  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [generalError, setGeneralError] = React.useState<string | null>(null);

  const form = useForm<CreditCardExpenseFormValues>({
    resolver: zodResolver(creditCardExpenseFormSchema),
    defaultValues: {
      creditCardId: "",
      description: "",
      purchaseDate: toIsoDate(new Date()),
      categoryId: "",
      subcategoryId: "",
      amount: "",
      entryType: "SINGLE",
      installmentCount: 1,
      notes: "",
    },
  });

  const selectedCategoryId = form.watch("categoryId");
  const entryType = form.watch("entryType");
  const amount = form.watch("amount");
  const installmentCount = form.watch("installmentCount");

  const availableSubCategories = React.useMemo(() => {
    if (!selectedCategoryId) return [];
    return subCategories.filter(
      (item) =>
        item.movementType === "EXPENSE" && item.category.id === selectedCategoryId,
    );
  }, [selectedCategoryId, subCategories]);

  React.useEffect(() => {
    if (!open) return;
    setFieldErrors({});
    setGeneralError(null);

    if (expense) {
      form.reset({
        creditCardId: expense.creditCardId,
        description: expense.description ?? "",
        purchaseDate: expense.purchaseDate || toIsoDate(new Date()),
        categoryId: expense.categoryId,
        subcategoryId: expense.subcategoryId,
        amount: amountToEditString(expense.amount),
        entryType:
          (expense.installmentCount ?? 1) > 1 ? "INSTALLMENT" : "SINGLE",
        installmentCount: expense.installmentCount ?? 1,
        notes: expense.notes ?? "",
      });
      return;
    }

    form.reset({
      creditCardId: "",
      description: "",
      purchaseDate: toIsoDate(new Date()),
      categoryId: "",
      subcategoryId: "",
      amount: "",
      entryType: "SINGLE",
      installmentCount: 1,
      notes: "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, expense?.id]);

  React.useEffect(() => {
    if (isEdit) return;
    if (entryType === "SINGLE") {
      form.setValue("installmentCount", 1, { shouldDirty: true });
    } else if (installmentCount < 2) {
      form.setValue("installmentCount", 2, { shouldDirty: true });
    }
  }, [entryType, form, installmentCount, isEdit]);

  const clearFieldError = React.useCallback((field: string) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const onSubmit = form.handleSubmit(async (values) => {
    setFieldErrors({});
    setGeneralError(null);

    const parsedAmount = parseMoneyInput(values.amount);
    const notes = values.notes.trim();

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({
          id: expense!.id,
          request: {
            description: values.description.trim(),
            purchaseDate: values.purchaseDate,
            categoryId: Number(values.categoryId),
            subcategoryId: Number(values.subcategoryId),
            amount: parsedAmount,
            notes: notes ? notes : null,
          },
        });
        success("Gasto do cartão atualizado com sucesso");
      } else {
        await createMutation.mutateAsync({
          creditCardId: Number(values.creditCardId),
          description: values.description.trim(),
          purchaseDate: values.purchaseDate,
          categoryId: Number(values.categoryId),
          subcategoryId: Number(values.subcategoryId),
          totalAmount: parsedAmount,
          installmentCount:
            values.entryType === "INSTALLMENT" ? Number(values.installmentCount) : 1,
          notes: notes ? notes : null,
        });
        success("Gasto do cartão cadastrado com sucesso");
      }
      onOpenChange(false);
    } catch (err) {
      const apiError = extractApiError(err);
      if (apiError?.errors?.length) {
        setFieldErrors(mapApiFieldErrors(apiError.errors));
        return;
      }
      const message =
        apiError?.detail ?? "Não foi possível salvar o gasto no cartão.";
      setGeneralError(message);
      error(message);
    }
  });

  const previewInstallmentAmount = React.useMemo(() => {
    if (entryType !== "INSTALLMENT") return null;
    const parsedAmount = parseMoneyInput(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0 || installmentCount <= 0) {
      return null;
    }
    return parsedAmount / installmentCount;
  }, [amount, entryType, installmentCount]);

  return (
    <FormDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Editar gasto no cartão" : "Novo gasto no cartão"}
      description={
        isEdit
          ? "Ajuste os dados do gasto respeitando as regras da fatura vinculada."
          : "Cadastre uma compra no cartão em lançamento único ou parcelado."
      }
      generalError={generalError}
      contentClassName="max-w-3xl"
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Cartão</Label>
            <Select
              value={form.watch("creditCardId") || "__none__"}
              disabled={isSubmitting || isEdit}
              onValueChange={(value) => {
                form.setValue("creditCardId", value === "__none__" ? "" : value, {
                  shouldDirty: true,
                });
                clearFieldError("creditCardId");
              }}
            >
              <SelectTrigger className={cn(getInputErrorClass(fieldErrors.creditCardId))}>
                <SelectValue placeholder="Selecione o cartão" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Selecione</SelectItem>
                {creditCards.map((card) => (
                  <SelectItem key={card.id} value={card.id}>
                    {card.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormFieldError
              message={fieldErrors.creditCardId ?? form.formState.errors.creditCardId?.message}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cc-expense-purchase-date">Data da compra</Label>
            <ExpenseFormDateField
              control={form.control}
              name="purchaseDate"
              id="cc-expense-purchase-date"
              placeholder="dd/mm/aaaa"
              className={cn(
                getInputErrorClass(
                  fieldErrors.purchaseDate ?? form.formState.errors.purchaseDate?.message,
                ),
              )}
              aria-invalid={!!(fieldErrors.purchaseDate ?? form.formState.errors.purchaseDate?.message)}
            />
            <FormFieldError
              message={fieldErrors.purchaseDate ?? form.formState.errors.purchaseDate?.message}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="cc-expense-description">Descrição</Label>
            <Input
              id="cc-expense-description"
              placeholder="Ex.: Compra no mercado"
              autoComplete="off"
              className={cn(getInputErrorClass(fieldErrors.description ?? form.formState.errors.description?.message))}
              {...form.register("description", {
                onChange: () => clearFieldError("description"),
              })}
            />
            <FormFieldError
              message={fieldErrors.description ?? form.formState.errors.description?.message}
            />
          </div>

          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select
              value={selectedCategoryId || "__none__"}
              disabled={isSubmitting}
              onValueChange={(value) => {
                const categoryId = value === "__none__" ? "" : value;
                form.setValue("categoryId", categoryId, { shouldDirty: true });
                const currentSub = form.getValues("subcategoryId");
                if (
                  currentSub &&
                  !subCategories.some(
                    (item) =>
                      item.id === currentSub &&
                      item.category.id === categoryId &&
                      item.movementType === "EXPENSE",
                  )
                ) {
                  form.setValue("subcategoryId", "", { shouldDirty: true });
                }
                clearFieldError("categoryId");
              }}
            >
              <SelectTrigger className={cn(getInputErrorClass(fieldErrors.categoryId))}>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Selecione</SelectItem>
                {categories
                  .filter((category) => category.movementType === "EXPENSE")
                  .map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <FormFieldError message={fieldErrors.categoryId ?? form.formState.errors.categoryId?.message} />
          </div>

          <div className="space-y-2">
            <Label>Subcategoria</Label>
            <Select
              value={form.watch("subcategoryId") || "__none__"}
              disabled={isSubmitting || !selectedCategoryId}
              onValueChange={(value) => {
                form.setValue("subcategoryId", value === "__none__" ? "" : value, {
                  shouldDirty: true,
                });
                clearFieldError("subcategoryId");
              }}
            >
              <SelectTrigger className={cn(getInputErrorClass(fieldErrors.subcategoryId))}>
                <SelectValue placeholder="Selecione a subcategoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Selecione</SelectItem>
                {availableSubCategories.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormFieldError
              message={fieldErrors.subcategoryId ?? form.formState.errors.subcategoryId?.message}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cc-expense-amount">
              {isEdit ? "Valor da parcela" : "Valor total da compra"}
            </Label>
            <MinorUnitMoneyInput
              id="cc-expense-amount"
              value={amount || ""}
              onChange={(next) => {
                form.setValue("amount", next, { shouldDirty: true });
                clearFieldError("amount");
              }}
              onBlur={() => {
                void form.trigger("amount");
              }}
              className={cn(getInputErrorClass(fieldErrors.amount ?? form.formState.errors.amount?.message))}
            />
            <FormFieldError message={fieldErrors.amount ?? form.formState.errors.amount?.message} />
          </div>

          <div className="space-y-2">
            <Label>Tipo</Label>
            <SegmentedControl
              value={entryType}
              onChange={(next) => {
                form.setValue("entryType", next, { shouldDirty: true });
                clearFieldError("entryType");
              }}
              options={[
                { value: "SINGLE", label: "Único" },
                { value: "INSTALLMENT", label: "Parcelado" },
              ]}
              disabled={isSubmitting || isEdit}
              fullWidth
              aria-label="Tipo de lançamento"
            />
          </div>

          {entryType === "INSTALLMENT" ? (
            <div className="space-y-2">
              <Label htmlFor="cc-expense-installments">Quantidade de parcelas</Label>
              <Input
                id="cc-expense-installments"
                type="number"
                min={2}
                max={120}
                disabled={isSubmitting || isEdit}
                className={cn(
                  getInputErrorClass(
                    fieldErrors.installmentCount ?? form.formState.errors.installmentCount?.message,
                  ),
                )}
                {...form.register("installmentCount", {
                  valueAsNumber: true,
                  onChange: () => clearFieldError("installmentCount"),
                })}
              />
              <p className="text-xs text-muted-foreground">
                Serão geradas {installmentCount} parcelas.
                {previewInstallmentAmount != null
                  ? ` Parcela estimada: ${formatCurrency(previewInstallmentAmount, currency)}.`
                  : ""}
              </p>
              <FormFieldError
                message={
                  fieldErrors.installmentCount ?? form.formState.errors.installmentCount?.message
                }
              />
            </div>
          ) : null}

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="cc-expense-notes">Observações</Label>
            <textarea
              id="cc-expense-notes"
              rows={3}
              placeholder="Opcional"
              autoComplete="off"
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
                : "Cadastrar gasto"}
          </Button>
        </DialogFooter>
      </form>
    </FormDialogShell>
  );
}
