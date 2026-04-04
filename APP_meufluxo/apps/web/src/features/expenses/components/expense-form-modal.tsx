"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { HelpCircle } from "lucide-react";
import { useForm } from "react-hook-form";

import type { ExpenseBatchConfirmEntry, ExpenseBatchPreviewEntry, ExpenseRecord } from "@meufluxo/types";
import { parseMoneyInput } from "@meufluxo/utils";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FilterSelect } from "@/components/filters";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { ChoiceRadioGroup } from "@/components/ui/choice-radio-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/components/toast";
import { extractApiError } from "@/lib/api-error";
import { useTranslation } from "@/lib/i18n";
import { useCreateExpenseBatch, useCreateSingleExpense, useUpdateExpense } from "@/hooks/api";
import { ExpenseBatchPreviewModal } from "@/features/expenses/components/expense-batch-preview-modal";
import {
  createExpenseCreateFormSchema,
  type ExpenseCreateFormValues,
} from "@/features/expenses/expense-create-form.schema";
import { ExpenseExpectedAmountInput } from "@/features/expenses/components/expense-expected-amount-input";
import { ExpenseFormDateField } from "@/features/expenses/components/expense-form-date-field";
import { applyBusinessDayAdjustmentsToPreviewEntries } from "@/features/expenses/expense-preview-business-day-adjust";
import { ExpenseRecurrenceInlineSentence } from "@/features/expenses/components/expense-recurrence-inline-sentence";
import { generateRecurringPreviewEntries, type ExpenseRecurrenceType } from "@/features/expenses/recurrence-utils";

type PreviewContext = {
  description: string;
  baseDocument: string | null;
  categoryId: number;
  subCategoryId: number | null;
  expectedAmount: number;
  amountBehavior: "FIXED" | "ESTIMATED";
  defaultAccountId: number | null;
  notes: string | null;
  categoryName: string;
  subCategoryName: string | null;
};

function todayIsoDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function ExpenseFormModal({
  open,
  onOpenChange,
  expense,
  categories,
  subCategories,
  accounts,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: ExpenseRecord | null;
  categories: Array<{ id: string; name: string; movementType?: string }>;
  subCategories: Array<{ id: string; name: string; categoryId: string }>;
  accounts: Array<{ id: string; name: string }>;
  onSaved: () => void;
}) {
  const truncate = React.useCallback((value: string, max: number) => {
    const trimmed = value.trim();
    if (trimmed.length <= max) return trimmed;
    return `${trimmed.slice(0, max - 1)}…`;
  }, []);
  const isEdit = !!expense;
  /** Altura ~10% menor que h-10, consistente entre inputs/selects do modal */
  const modalFieldHm = "h-10 min-h-10";
  const { t } = useTranslation();
  const { success, error } = useToast();

  const createSingleMutation = useCreateSingleExpense();
  const updateMutation = useUpdateExpense();
  const createBatchMutation = useCreateExpenseBatch();

  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [previewEntries, setPreviewEntries] = React.useState<ExpenseBatchPreviewEntry[]>([]);
  const [previewContext, setPreviewContext] = React.useState<PreviewContext | null>(null);
  const [batchConfirmError, setBatchConfirmError] = React.useState<string | null>(null);

  const expenseFormSchema = React.useMemo(() => createExpenseCreateFormSchema(t), [t]);

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
      issueDate: "",
      dueDate: "",
      document: "",
      defaultAccountId: "",
      notes: "",
      repetitionsCount: "",
      intervalDays: "",
    },
  });

  const selectedCategoryId = form.watch("categoryId");
  const creationType = form.watch("creationType");
  const recurrenceType = form.watch("recurrenceType") ?? "INTERVAL_DAYS";
  const amountBehavior = form.watch("amountBehavior");

  const expenseCategories = React.useMemo(
    () => categories.filter((category) => category.movementType !== "INCOME"),
    [categories],
  );

  const availableSubCategories = React.useMemo(() => {
    if (!selectedCategoryId) return [];
    return subCategories.filter((subCategory) => subCategory.categoryId === selectedCategoryId);
  }, [selectedCategoryId, subCategories]);

  React.useEffect(() => {
    if (!open) return;
    if (expense) {
      form.reset({
        creationType: "SINGLE",
        recurrenceType: "INTERVAL_DAYS",
        description: expense.description,
        categoryId: expense.categoryId,
        subCategoryId: expense.subCategoryId ?? "",
        expectedAmount: String(expense.expectedAmount),
        amountBehavior: expense.amountBehavior,
        issueDate: "",
        dueDate: expense.dueDate,
        document: "",
        defaultAccountId: expense.defaultAccountId ?? "",
        notes: expense.notes ?? "",
        repetitionsCount: "",
        intervalDays: "",
      });
    } else {
      form.reset({
        creationType: "SINGLE",
        recurrenceType: "INTERVAL_DAYS",
        description: "",
        categoryId: "",
        subCategoryId: "",
        expectedAmount: "",
        amountBehavior: "FIXED",
        issueDate: "",
        dueDate: "",
        document: "",
        defaultAccountId: "",
        notes: "",
        repetitionsCount: "",
        intervalDays: "",
      });
    }
    setPreviewOpen(false);
    setPreviewEntries([]);
    setPreviewContext(null);
    setBatchConfirmError(null);
  }, [expense, form, open]);

  React.useEffect(() => {
    const currentSubCategory = form.getValues("subCategoryId");
    if (!currentSubCategory) return;
    const stillValid = availableSubCategories.some((item) => item.id === currentSubCategory);
    if (!stillValid) {
      form.setValue("subCategoryId", "");
    }
  }, [availableSubCategories, form]);

  React.useEffect(() => {
    if (isEdit || creationType !== "SINGLE") return;
    form.setValue("repetitionsCount", "");
    form.setValue("intervalDays", "");
    form.clearErrors(["repetitionsCount", "intervalDays", "recurrenceType"]);
  }, [creationType, form, isEdit]);

  React.useEffect(() => {
    if (recurrenceType !== "FIXED_DATES") return;
    form.setValue("intervalDays", "");
    form.clearErrors("intervalDays");
  }, [recurrenceType, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    if (!values.issueDate?.trim()) {
      const fallbackIssueDate = todayIsoDate();
      form.setValue("issueDate", fallbackIssueDate, {
        shouldDirty: false,
        shouldTouch: false,
      });
      values.issueDate = fallbackIssueDate;
    }

    // issueDate e document: formulário pronto para persistência futura; API atual não expõe esses campos em PlannedEntry.
    void values.issueDate;
    void values.document;

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
      expectedAmount: parseMoneyInput(values.expectedAmount),
      amountBehavior: values.amountBehavior,
      defaultAccountId: values.defaultAccountId ? Number(values.defaultAccountId) : null,
      notes: values.notes?.trim() ? values.notes.trim() : null,
    } as const;

    try {
      if (isEdit && expense) {
        await updateMutation.mutateAsync({
          id: expense.id,
          request: {
            ...payloadBase,
            issueDate: values.issueDate,
            dueDate: values.dueDate,
          },
        });
        success("Despesa atualizada com sucesso.");
        onOpenChange(false);
        onSaved();
        return;
      }

      if (values.creationType === "SINGLE") {
        await createSingleMutation.mutateAsync({
          ...payloadBase,
          issueDate: values.issueDate,
          dueDate: values.dueDate,
        });
        success(t("expenses.feedback.singleCreated"));
        onOpenChange(false);
        onSaved();
        return;
      }

      const recurrenceType = values.recurrenceType as ExpenseRecurrenceType | undefined;
      if (!recurrenceType) {
        form.setError("recurrenceType", { message: "Tipo de recorrência é obrigatório." });
        return;
      }

      const repetitionsCount = Number(values.repetitionsCount ?? "");
      const intervalDays = values.intervalDays ? Number(values.intervalDays) : undefined;

      const generatedEntries = generateRecurringPreviewEntries({
        recurrenceType,
        issueDate: values.issueDate,
        firstDueDate: values.dueDate,
        repetitionsCount,
        intervalDays: recurrenceType === "INTERVAL_DAYS" ? intervalDays : undefined,
        expectedAmount: payloadBase.expectedAmount,
      });

      if (!generatedEntries.length) {
        error(t("expenses.feedback.previewEmpty"));
        return;
      }

      const previewEntries = await applyBusinessDayAdjustmentsToPreviewEntries(generatedEntries);

      setPreviewContext({
        description: payloadBase.description,
        baseDocument: values.document?.trim() ? values.document.trim() : null,
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
        success(t("expenses.feedback.batchCreated"));
        setPreviewOpen(false);
        onOpenChange(false);
        onSaved();
      } catch (err) {
        const apiError = extractApiError(err);
        const message = apiError?.detail ?? t("expenses.feedback.batchError");
        setBatchConfirmError(message);
        error(message);
      }
    },
    [createBatchMutation, error, onOpenChange, onSaved, previewContext, success, t],
  );

  const isSubmitting =
    createSingleMutation.isPending || updateMutation.isPending;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        {/* //AQUI MUDA CSS MODAL */}
        <DialogContent className="flex max-h-[95vh] min-h-0 w-[min(100%,48rem)] max-w-2.1xl flex-col overflow-hidden">
          <DialogHeader className="shrink-0">
            <DialogTitle>{isEdit ? "Editar despesa" : "Nova despesa"}</DialogTitle>
          </DialogHeader>

          <form
            className="flex min-h-0 w-full flex-1 flex-col overflow-hidden"
            onSubmit={onSubmit}
            autoComplete="off"
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="none"
            data-lpignore="true"
            data-1p-ignore="true"
            data-form-type="other"
          >
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-y-contain px-2">
            {/* Linha 1 — descrição */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="expense-modal-description">{t("expenses.form.description")}</Label>
              <Input
                id="expense-modal-description"
                className={`${modalFieldHm} pr-10`}
                maxLength={80}
                autoComplete="off"
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="none"
                data-lpignore="true"
                data-1p-ignore="true"
                data-form-type="other"
                {...form.register("description")}
              />
            </div>

            {/* Linha — categoria, subcategoria, conta de pagamento */}
            <div className="grid gap-4 sm:grid-cols-3 sm:items-end">
              <div className="flex min-w-0 flex-col gap-1.5">
                <Label htmlFor="expense-modal-category">{t("expenses.form.category")}</Label>
                <FilterSelect
                  id="expense-modal-category"
                  name="expense_category_id"
                  value={form.watch("categoryId") || ""}
                  onChange={(value) => form.setValue("categoryId", value, { shouldDirty: true })}
                  options={expenseCategories.map((category) => ({
                    value: category.id,
                    label: truncate(category.name, 40),
                  }))}
                  placeholder={t("expenses.form.selectCategory")}
                  triggerClassName={`min-w-0 w-full ${modalFieldHm}`}
                />
              </div>
              <div className="flex min-w-0 flex-col gap-1.5">
                <Label htmlFor="expense-modal-subcategory">{t("expenses.form.subCategory")}</Label>
                <FilterSelect
                  id="expense-modal-subcategory"
                  name="expense_subcategory_id"
                  value={form.watch("subCategoryId") || ""}
                  onChange={(value) => form.setValue("subCategoryId", value, { shouldDirty: true })}
                  options={availableSubCategories.map((subcategory) => ({
                    value: subcategory.id,
                    label: truncate(subcategory.name, 40),
                  }))}
                  placeholder={t("expenses.form.selectSubCategory")}
                  disabled={!selectedCategoryId}
                  triggerClassName={`min-w-0 w-full ${modalFieldHm}`}
                />
              </div>
              <div className="flex min-h-0 min-w-0 flex-col gap-1.5">
                <Label htmlFor="expense-modal-account">{t("expenses.form.suggestedAccount")}</Label>
                <FilterSelect
                  id="expense-modal-account"
                  name="expense_account_id"
                  value={form.watch("defaultAccountId") || ""}
                  onChange={(value) => form.setValue("defaultAccountId", value, { shouldDirty: true })}
                  options={accounts.map((account) => ({
                    value: String(account.id),
                    label: truncate(account.name, 40),
                  }))}
                  placeholder={t("expenses.form.selectAccount")}
                  triggerClassName={`min-w-0 w-full ${modalFieldHm}`}
                />
              </div>
            </div>

            {/* Linha — emissão, vencimento, documento, valor (grid 4 colunas em sm+) */}
            <div className="grid gap-3 sm:grid-cols-[23fr_23fr_24fr_30fr] sm:items-end">
              <div className="flex min-h-0 min-w-0 flex-col gap-1.5">
                <Label htmlFor="expense-modal-issue-date">{t("expenses.form.issueDate")}</Label>
                <ExpenseFormDateField
                  control={form.control}
                  name="issueDate"
                  id="expense-modal-issue-date"
                  inputName="expense_issue_date"
                  containerClassName="min-w-0 w-full"
                  className={`${modalFieldHm} text-center`}
                  placeholder={t("expenses.form.datePlaceholder")}
                  fillTodayOnBlurIfEmpty
                  autoComplete="off"
                  spellCheck={false}
                  autoCorrect="off"
                  autoCapitalize="none"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  data-form-type="other"
                  calendarButtonAriaLabel="Abrir calendário de emissão"
                  aria-invalid={!!form.formState.errors.issueDate}
                />
                {form.formState.errors.issueDate ? (
                  <p className="text-xs text-destructive">{form.formState.errors.issueDate.message}</p>
                ) : null}
              </div>
              <div className="flex min-h-0 min-w-0 flex-col gap-1.5">
                <Label htmlFor={isEdit ? "expense-modal-due-date-edit" : "expense-modal-due-date"}>
                  {!isEdit && creationType === "RECURRING"
                    ? t("expenses.form.firstDueDate")
                    : t("expenses.form.dueDate")}
                </Label>
                <ExpenseFormDateField
                  control={form.control}
                  name="dueDate"
                  id={isEdit ? "expense-modal-due-date-edit" : "expense-modal-due-date"}
                  inputName="expense_due_date"
                  containerClassName="min-w-0 w-full"
                  className={`${modalFieldHm} text-center`}
                  placeholder={t("expenses.form.datePlaceholder")}
                  autoComplete="off"
                  spellCheck={false}
                  autoCorrect="off"
                  autoCapitalize="none"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  data-form-type="other"
                  calendarButtonAriaLabel="Abrir calendário de vencimento"
                  aria-invalid={!!form.formState.errors.dueDate}
                />
                {form.formState.errors.dueDate ? (
                  <p className="text-xs text-destructive">{form.formState.errors.dueDate.message}</p>
                ) : null}
              </div>
              <div className="flex min-h-0 min-w-0 flex-col gap-1.5">
                <Label htmlFor="expense-modal-document">{t("expenses.form.document")}</Label>
                <Input
                  id="expense-modal-document"
                  className={`${modalFieldHm} pr-10`}
                  maxLength={80}
                  autoComplete="off"
                  spellCheck={false}
                  autoCorrect="off"
                  autoCapitalize="none"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  data-form-type="other"
                  placeholder={t("expenses.form.documentPlaceholder")}
                  {...form.register("document")}
                />
                {form.formState.errors.document ? (
                  <p className="text-xs text-destructive">{form.formState.errors.document.message}</p>
                ) : null}
              </div>
              <div className="flex min-h-0 min-w-0 flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <Label htmlFor="expense-modal-amount" className="shrink-0">
                    {t("expenses.form.amount")}
                  </Label>
                  <Tooltip delayDuration={200}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="text-muted-foreground shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                        aria-label={t("expenses.form.amountBehavior")}
                        tabIndex={-1}
                      >
                        <HelpCircle className="h-3.5 w-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      {amountBehavior === "FIXED"
                        ? t("expenses.form.amountBehavior.fixedHint")
                        : t("expenses.form.amountBehavior.estimatedHint")}
                    </TooltipContent>
                  </Tooltip>
                  <SegmentedControl
                    size="sm"
                    className="shrink-0"
                    value={amountBehavior}
                    onChange={(next) => form.setValue("amountBehavior", next)}
                    tabStop="none"
                    aria-label={t("expenses.form.amountBehavior")}
                    options={
                      [
                        { value: "FIXED", label: t("expenses.form.amountBehavior.fixed") },
                        { value: "ESTIMATED", label: t("expenses.form.amountBehavior.estimated") },
                      ] as const
                    }
                  />
                </div>
                <div className="flex min-w-0 flex-col gap-1.5">
                  <ExpenseExpectedAmountInput
                    className={`${modalFieldHm} pr-10`}
                    control={form.control}
                    name="expectedAmount"
                    id="expense-modal-amount"
                    autoComplete="off"
                    spellCheck={false}
                    autoCorrect="off"
                    autoCapitalize="none"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    data-form-type="other"
                    aria-invalid={!!form.formState.errors.expectedAmount}
                  />
                  {form.formState.errors.expectedAmount ? (
                    <p className="text-xs text-destructive">{form.formState.errors.expectedAmount.message}</p>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Linha 4 — tipo de criação + modo de recorrência (somente criação); frase dinâmica abaixo */}
            {!isEdit ? (
              <section
                className="space-y-3"
                aria-labelledby="expense-modal-creation-type-label expense-modal-recurrence-type-label"
              >
                <div className="grid gap-4 sm:grid-cols-[50fr_50fr] sm:items-start">
                  <div className="flex min-w-0 flex-col gap-1.5">
                    <Label id="expense-modal-creation-type-label">
                      {t("expenses.form.creationType")}
                    </Label>
                    <ChoiceRadioGroup
                      value={creationType}
                      onChange={(next) => form.setValue("creationType", next)}
                      aria-labelledby="expense-modal-creation-type-label"
                      options={
                        [
                          {
                            value: "SINGLE",
                            title: t("expenses.form.creationType.singleTitle"),
                            description: t("expenses.form.creationType.singleDescription"),
                          },
                          {
                            value: "RECURRING",
                            title: t("expenses.form.creationType.recurringTitle"),
                            description: t("expenses.form.creationType.recurringDescription"),
                          },
                        ] as const
                      }
                    />
                  </div>
                  <div
                    className={
                      creationType === "SINGLE"
                        ? "pointer-events-none flex min-w-0 flex-col gap-1.5 opacity-50"
                        : "flex min-w-0 flex-col gap-1.5"
                    }
                  >
                    <Label
                      id="expense-modal-recurrence-type-label"
                      className={
                        creationType === "SINGLE" ? "text-muted-foreground" : undefined
                      }
                    >
                      {t("expenses.form.recurrence.recurrenceType")}
                    </Label>
                    <ChoiceRadioGroup
                      value={recurrenceType}
                      onChange={(next) =>
                        form.setValue("recurrenceType", next as ExpenseRecurrenceType, {
                          shouldDirty: true,
                        })
                      }
                      disabled={creationType === "SINGLE"}
                      aria-labelledby="expense-modal-recurrence-type-label"
                      options={
                        [
                          {
                            value: "FIXED_DATES",
                            title: t("expenses.form.recurrence.fixedDateTitle"),
                            description: t("expenses.form.recurrence.fixedDateDescription"),
                          },
                          {
                            value: "INTERVAL_DAYS",
                            title: t("expenses.form.recurrence.intervalDaysTitle"),
                            description: t("expenses.form.recurrence.intervalDaysDescription"),
                          },
                        ] as const
                      }
                    />
                  </div>
                </div>
                {creationType === "RECURRING" ? (
                  <ExpenseRecurrenceInlineSentence
                    form={form}
                    t={t}
                    recurrenceType={recurrenceType}
                    idPrefix="expense-modal"
                  />
                ) : null}
              </section>
            ) : null}

            {/* Linha 5 — observações */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="expense-modal-notes">{t("expenses.form.notes")}</Label>
              <textarea
                id="expense-modal-notes"
                maxLength={250}
                autoComplete="off"
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="none"
                data-lpignore="true"
                data-1p-ignore="true"
                data-form-type="other"
                className="box-border h-[3rem] w-full resize-none overflow-y-auto overscroll-y-contain rounded-lg border border-input bg-input px-3 py-2 text-sm shadow-sm ring-offset-background transition-[color,box-shadow,border-color] placeholder:text-muted-foreground hover:border-primary/50 hover:shadow-sm dark:hover:border-primary/60 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:focus-visible:ring-primary/35 disabled:cursor-not-allowed disabled:opacity-50"
                {...form.register("notes")}
              />
            </div>
            </div>

            <DialogFooter className="mt-4 shrink-0 gap-3 border-t border-border/60 pt-4 sm:gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? t("expenses.actions.loadingPreview")
                  : isEdit
                    ? t("expenses.actions.saveChanges")
                    : creationType === "RECURRING"
                      ? t("expenses.actions.generatePreview")
                      : t("expenses.actions.createSingle")}
              </Button>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                {t("expenses.actions.cancel")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ExpenseBatchPreviewModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        description={previewContext?.description ?? ""}
        baseDocument={previewContext?.baseDocument ?? null}
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

