"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import type { ExpenseBatchConfirmEntry, ExpenseBatchPreviewEntry } from "@meufluxo/types";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/toast";
import { useTranslation } from "@/lib/i18n";
import { useAccounts, useCategories, useCreateExpenseBatch, useCreateSingleExpense, useSubCategories } from "@/hooks/api";
import { extractApiError } from "@/lib/api-error";
import { ExpenseBatchPreviewModal } from "@/features/expenses/components/expense-batch-preview-modal";
import {
  createExpenseCreateFormSchema,
  type ExpenseCreateFormValues,
} from "@/features/expenses/expense-create-form.schema";
import { ExpenseExpectedAmountInput } from "@/features/expenses/components/expense-expected-amount-input";
import { ExpenseRecurrenceSection } from "@/features/expenses/components/expense-recurrence-section";
import { generateRecurringPreviewEntries, type ExpenseRecurrenceType } from "@/features/expenses/recurrence-utils";

type PreviewContext = {
  description: string;
  categoryId: number;
  subCategoryId: number | null;
  expectedAmount: number;
  amountBehavior: "FIXED" | "ESTIMATED";
  defaultAccountId: number | null;
  notes: string | null;
  categoryName: string;
  subCategoryName: string | null;
};

export default function ExpenseRegistrationsPage() {
  const { t } = useTranslation();
  const expenseFormSchema = React.useMemo(() => createExpenseCreateFormSchema(t), [t]);
  const { success, error } = useToast();
  const categoriesQuery = useCategories({ realOnly: true });
  const subCategoriesQuery = useSubCategories({ realOnly: true });
  const { data: categories = [] } = categoriesQuery;
  const { data: subCategories = [] } = subCategoriesQuery;
  const { data: accounts = [] } = useAccounts();
  const createSingleMutation = useCreateSingleExpense();
  const createBatchMutation = useCreateExpenseBatch();

  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [previewEntries, setPreviewEntries] = React.useState<ExpenseBatchPreviewEntry[]>([]);
  const [previewContext, setPreviewContext] = React.useState<PreviewContext | null>(null);
  const [batchConfirmError, setBatchConfirmError] = React.useState<string | null>(null);

  const form = useForm<ExpenseCreateFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      creationType: "SINGLE",
      recurrenceType: "INTERVAL_DAYS",
      description: "",
      categoryId: "",
      subCategoryId: "",
      expectedAmount: "",
      amountBehavior: "FIXED",
      dueDate: "",
      defaultAccountId: "",
      notes: "",
      repetitionsCount: "",
      intervalDays: "",
    },
  });

  const selectedCategoryId = form.watch("categoryId");
  const creationType = form.watch("creationType");
  const recurrenceType = form.watch("recurrenceType") ?? "INTERVAL_DAYS";
  const expenseCategories = React.useMemo(
    () => categories.filter((category) => category.movementType === "EXPENSE"),
    [categories],
  );

  const availableSubCategories = React.useMemo(() => {
    if (!selectedCategoryId) return [];
    return subCategories.filter((subCategory) => subCategory.category.id === selectedCategoryId);
  }, [selectedCategoryId, subCategories]);

  React.useEffect(() => {
    const currentSubCategory = form.getValues("subCategoryId");
    if (!currentSubCategory) return;
    const stillValid = availableSubCategories.some((item) => item.id === currentSubCategory);
    if (!stillValid) {
      form.setValue("subCategoryId", "");
    }
  }, [availableSubCategories, form, selectedCategoryId]);

  const onSubmit = form.handleSubmit(async (values) => {
    const category = expenseCategories.find((item) => item.id === values.categoryId);
    if (!category) {
      form.setError("categoryId", { message: t("expenses.validation.categoryRequired") });
      return;
    }

    const subCategory = values.subCategoryId
      ? availableSubCategories.find((item) => item.id === values.subCategoryId)
      : null;

    if (values.subCategoryId && !subCategory) {
      form.setError("subCategoryId", {
        message: t("expenses.validation.invalidSubCategory"),
      });
      return;
    }

    const payloadBase = {
      description: values.description.trim(),
      categoryId: Number(values.categoryId),
      subCategoryId: values.subCategoryId ? Number(values.subCategoryId) : null,
      expectedAmount: Number(values.expectedAmount),
      amountBehavior: values.amountBehavior,
      defaultAccountId: values.defaultAccountId ? Number(values.defaultAccountId) : null,
      notes: values.notes?.trim() ? values.notes.trim() : null,
    } as const;

    try {
      if (values.creationType === "SINGLE") {
        await createSingleMutation.mutateAsync({
          ...payloadBase,
          dueDate: values.dueDate,
        });
        success(t("expenses.feedback.singleCreated"));
        form.reset({
          ...form.getValues(),
          description: "",
          expectedAmount: "",
          dueDate: "",
          notes: "",
        });
        return;
      }

      const recurrenceType = values.recurrenceType as ExpenseRecurrenceType | undefined;
      if (!recurrenceType) {
        form.setError("recurrenceType", { message: "Tipo de recorrência é obrigatório." });
        return;
      }

      const repetitionsCount = Number(values.repetitionsCount ?? "");
      const intervalDays = values.intervalDays ? Number(values.intervalDays) : undefined;

      const previewEntries = generateRecurringPreviewEntries({
        recurrenceType,
        firstDueDate: values.dueDate,
        repetitionsCount,
        intervalDays: recurrenceType === "INTERVAL_DAYS" ? intervalDays : undefined,
        expectedAmount: payloadBase.expectedAmount,
      });

      if (!previewEntries.length) {
        error(t("expenses.feedback.previewEmpty"));
        return;
      }

      setPreviewContext({
        description: payloadBase.description,
        categoryId: payloadBase.categoryId,
        subCategoryId: payloadBase.subCategoryId,
        expectedAmount: payloadBase.expectedAmount,
        amountBehavior: payloadBase.amountBehavior,
        defaultAccountId: payloadBase.defaultAccountId,
        notes: payloadBase.notes,
        categoryName: category.name,
        subCategoryName: subCategory?.name ?? null,
      });
      setBatchConfirmError(null);
      setPreviewEntries(previewEntries);
      setPreviewOpen(true);
    } catch (err) {
      const apiError = extractApiError(err);
      error(apiError?.detail ?? t("expenses.feedback.submitError"));
    }
  });

  const handleConfirmBatch = React.useCallback(
    async (entries: ExpenseBatchConfirmEntry[]) => {
      if (!previewContext) return;
      try {
        setBatchConfirmError(null);
        await createBatchMutation.mutateAsync({
          description: previewContext.description,
          categoryId: previewContext.categoryId,
          subCategoryId: previewContext.subCategoryId,
          amountBehavior: previewContext.amountBehavior,
          defaultAccountId: previewContext.defaultAccountId,
          notes: previewContext.notes,
          entries,
        });
        setPreviewOpen(false);
        setPreviewEntries([]);
        setPreviewContext(null);
        success(t("expenses.feedback.batchCreated"));
        form.reset({
          ...form.getValues(),
          description: "",
          expectedAmount: "",
          dueDate: "",
          notes: "",
        });
      } catch (err) {
        const apiError = extractApiError(err);
        const message = apiError?.detail ?? t("expenses.feedback.batchError");
        setBatchConfirmError(message);
        error(message);
      }
    },
    [createBatchMutation, error, form, previewContext, success, t],
  );

  const submitting = createSingleMutation.isPending;
  const categoriesLoading = categoriesQuery.isLoading;
  const categoriesError = categoriesQuery.isError;
  const categoriesEmpty = !categoriesLoading && !categoriesError && expenseCategories.length === 0;
  const subCategoriesLoading = subCategoriesQuery.isLoading;
  const subCategoriesError = subCategoriesQuery.isError;

  const selectTriggerClassName =
    "flex h-10 min-h-10 w-full items-center gap-2 py-0 text-sm leading-none box-border " +
    "data-[state=open]:border-primary data-[state=open]:shadow-md data-[state=open]:ring-2 data-[state=open]:ring-primary/25 data-[state=open]:ring-offset-2 data-[state=open]:ring-offset-background dark:data-[state=open]:ring-primary/35";

  /** Lista dos selects: mesma largura que o painel do "Tipo do valor" (~20rem na coluna do grid). */
  const selectContentClassName =
    "rounded-xl border bg-popover shadow-lg w-[min(20rem,calc(100vw-2rem))] min-w-[min(20rem,calc(100vw-2rem))]";
  const selectContentViewportClassName = "!min-w-0 w-full";

  return (
    <>
      <section className="space-y-6">
        <PageHeader
          title={t("expenses.registrations.title")}
          description={t("expenses.registrations.description")}
        />

        <Card>
          <CardHeader>
            <CardTitle>{t("expenses.form.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="expense-description">{t("expenses.form.description")}</Label>
                <Input id="expense-description" {...form.register("description")} />
                {form.formState.errors.description ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.description.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="expense-category">{t("expenses.form.category")}</Label>
                <Select
                  value={form.watch("categoryId") || "__none"}
                  onValueChange={(value) =>
                    form.setValue("categoryId", value === "__none" ? "" : value, { shouldDirty: true })
                  }
                  disabled={categoriesLoading || categoriesError}
                >
                  <SelectTrigger id="expense-category" className={selectTriggerClassName}>
                    <SelectValue placeholder={t("expenses.form.selectCategory")} />
                  </SelectTrigger>
                  <SelectContent
                    className={selectContentClassName}
                    viewportClassName={selectContentViewportClassName}
                    position="popper"
                    sideOffset={6}
                  >
                    <SelectItem value="__none" className="rounded-lg py-2 cursor-pointer focus:bg-accent">
                      {t("expenses.form.selectCategory")}
                    </SelectItem>
                    {expenseCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id} className="rounded-lg py-2 cursor-pointer focus:bg-accent">
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.categoryId ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.categoryId.message}
                  </p>
                ) : null}
                {categoriesLoading ? (
                  <p className="text-xs text-muted-foreground">{t("expenses.form.categoriesLoading")}</p>
                ) : null}
                {categoriesError ? (
                  <p className="text-xs text-destructive">{t("expenses.form.categoriesError")}</p>
                ) : null}
                {categoriesEmpty ? (
                  <p className="text-xs text-muted-foreground">{t("expenses.form.categoriesEmpty")}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="expense-subcategory">{t("expenses.form.subCategory")}</Label>
                <Select
                  value={form.watch("subCategoryId") || "__none"}
                  onValueChange={(value) =>
                    form.setValue("subCategoryId", value === "__none" ? "" : value, { shouldDirty: true })
                  }
                  disabled={!selectedCategoryId || subCategoriesLoading || subCategoriesError}
                >
                  <SelectTrigger id="expense-subcategory" className={selectTriggerClassName}>
                    <SelectValue placeholder={t("expenses.form.selectSubCategory")} />
                  </SelectTrigger>
                  <SelectContent
                    className={selectContentClassName}
                    viewportClassName={selectContentViewportClassName}
                    position="popper"
                    sideOffset={6}
                  >
                    <SelectItem value="__none" className="rounded-lg py-2 cursor-pointer focus:bg-accent">
                      {t("expenses.form.selectSubCategory")}
                    </SelectItem>
                    {availableSubCategories.map((subCategory) => (
                      <SelectItem key={subCategory.id} value={subCategory.id} className="rounded-lg py-2 cursor-pointer focus:bg-accent">
                        {subCategory.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!selectedCategoryId ? (
                  <p className="text-xs text-muted-foreground">{t("expenses.form.subCategoryDisabledHint")}</p>
                ) : null}
                {subCategoriesLoading ? (
                  <p className="text-xs text-muted-foreground">{t("expenses.form.subCategoriesLoading")}</p>
                ) : null}
                {subCategoriesError ? (
                  <p className="text-xs text-destructive">{t("expenses.form.subCategoriesError")}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="expense-amount">{t("expenses.form.amount")}</Label>
                <ExpenseExpectedAmountInput
                  control={form.control}
                  name="expectedAmount"
                  id="expense-amount"
                  className="max-w-[150px]"
                  aria-invalid={!!form.formState.errors.expectedAmount}
                />
                {form.formState.errors.expectedAmount ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.expectedAmount.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="expense-amount-behavior">{t("expenses.form.amountBehavior")}</Label>
                <Select
                  value={form.watch("amountBehavior")}
                  onValueChange={(value) =>
                    form.setValue("amountBehavior", value as "FIXED" | "ESTIMATED", { shouldDirty: true })
                  }
                >
                  <SelectTrigger id="expense-amount-behavior" className={selectTriggerClassName}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    className={selectContentClassName}
                    viewportClassName={selectContentViewportClassName}
                    position="popper"
                    sideOffset={6}
                  >
                    <SelectItem value="FIXED" className="rounded-lg py-2 cursor-pointer focus:bg-accent">
                      {t("expenses.form.amountBehavior.fixed")}
                    </SelectItem>
                    <SelectItem value="ESTIMATED" className="rounded-lg py-2 cursor-pointer focus:bg-accent">
                      {t("expenses.form.amountBehavior.estimated")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="expense-account">{t("expenses.form.suggestedAccount")}</Label>
                <Select
                  value={form.watch("defaultAccountId") || "__none"}
                  onValueChange={(value) =>
                    form.setValue("defaultAccountId", value === "__none" ? "" : value, { shouldDirty: true })
                  }
                >
                  <SelectTrigger id="expense-account" className={selectTriggerClassName}>
                    <SelectValue placeholder={t("expenses.form.selectAccount")} />
                  </SelectTrigger>
                  <SelectContent
                    className={selectContentClassName}
                    viewportClassName={selectContentViewportClassName}
                    position="popper"
                    sideOffset={6}
                  >
                    <SelectItem value="__none" className="rounded-lg py-2 cursor-pointer focus:bg-accent">
                      {t("expenses.form.selectAccount")}
                    </SelectItem>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id} className="rounded-lg py-2 cursor-pointer focus:bg-accent">
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label id="expense-creation-type-label">{t("expenses.form.creationType")}</Label>
                <SegmentedControl
                  className="max-w-[16rem]"
                  value={creationType}
                  onChange={(next) => form.setValue("creationType", next, { shouldDirty: true })}
                  fullWidth
                  aria-labelledby="expense-creation-type-label"
                  options={
                    [
                      { value: "SINGLE", label: t("expenses.form.creationType.single") },
                      { value: "RECURRING", label: t("expenses.form.creationType.recurring") },
                    ] as const
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expense-due-date">
                  {creationType === "RECURRING"
                    ? t("expenses.form.firstDueDate")
                    : t("expenses.form.dueDate")}
                </Label>
                <Input
                  id="expense-due-date"
                  type="date"
                  className="w-[150px] max-w-full shrink-0"
                  {...form.register("dueDate")}
                />
                {form.formState.errors.dueDate ? (
                  <p className="text-xs text-destructive">{form.formState.errors.dueDate.message}</p>
                ) : null}
              </div>

              {creationType === "RECURRING" ? (
                <div className="md:col-span-2">
                  <ExpenseRecurrenceSection form={form} t={t} recurrenceType={recurrenceType} idPrefix="expense" density="comfortable" />
                </div>
              ) : null}

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="expense-notes">{t("expenses.form.notes")}</Label>
                <Input id="expense-notes" maxLength={250} autoComplete="off" {...form.register("notes")} />
              </div>

              <div className="md:col-span-2 flex justify-end">
                <Button type="submit" disabled={submitting}>
                  {submitting
                    ? t("expenses.actions.loadingPreview")
                    : creationType === "RECURRING"
                      ? t("expenses.actions.generatePreview")
                      : t("expenses.actions.createSingle")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>

      <ExpenseBatchPreviewModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        description={previewContext?.description ?? ""}
        categoryName={previewContext?.categoryName ?? ""}
        subCategoryName={previewContext?.subCategoryName ?? null}
        baseAmount={previewContext?.expectedAmount ?? 0}
        amountBehavior={previewContext?.amountBehavior ?? "FIXED"}
        entries={previewEntries}
        confirming={createBatchMutation.isPending}
        confirmError={batchConfirmError}
        onConfirm={handleConfirmBatch}
      />
    </>
  );
}
