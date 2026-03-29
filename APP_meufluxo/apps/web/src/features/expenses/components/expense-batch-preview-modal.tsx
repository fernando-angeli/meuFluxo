"use client";

import * as React from "react";

import type {
  ExpenseBatchConfirmEntry,
  ExpenseBatchPreviewEntry,
  PlannedAmountBehavior,
} from "@meufluxo/types";
import {
  amountToEditString,
  formatCurrency,
  intlLocaleFromAppLocale,
  parseMoneyInput,
  resolveWalletCurrency,
} from "@meufluxo/utils";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MinorUnitMoneyInput } from "@/components/ui/minor-unit-money-input";
import { Badge } from "@/components/ui/badge";
import { useTranslation, useLocale } from "@/lib/i18n";
import { useAuthOptional } from "@/hooks/useAuth";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CalendarCheck2 } from "lucide-react";

type ExpenseBatchReviewDraftEntry = ExpenseBatchPreviewEntry & {
  document: string;
  initialDocument: string;
  initialDueDate: string;
  initialExpectedAmount: number;
  systemAdjustments: string[];
};

type ExpenseBatchPreviewModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  description: string;
  baseDocument?: string | null;
  categoryName: string;
  subCategoryName?: string | null;
  baseAmount: number;
  amountBehavior: PlannedAmountBehavior;
  entries: ExpenseBatchPreviewEntry[];
  confirming?: boolean;
  confirmError?: string | null;
  onConfirm: (entries: ExpenseBatchConfirmEntry[]) => Promise<void>;
};

export function ExpenseBatchPreviewModal({
  open,
  onOpenChange,
  description,
  baseDocument,
  categoryName,
  subCategoryName,
  baseAmount,
  amountBehavior,
  entries,
  confirming = false,
  confirmError = null,
  onConfirm,
}: ExpenseBatchPreviewModalProps) {
  const { t } = useTranslation();
  const { locale: appLocale } = useLocale();
  const auth = useAuthOptional();
  const currency = resolveWalletCurrency(auth?.preferences?.currency);
  const intlLocale = intlLocaleFromAppLocale(appLocale);

  const [draftEntries, setDraftEntries] = React.useState<ExpenseBatchReviewDraftEntry[]>([]);

  const buildSequentialDocument = React.useCallback((base: string | null | undefined, order: number) => {
    const trimmed = base?.trim() ?? "";
    if (!trimmed) return "";
    const suffix = String(order).padStart(2, "0");
    return `${trimmed}/${suffix}`;
  }, []);

  const toSystemAdjustmentMessages = React.useCallback(
    (entry: ExpenseBatchPreviewEntry): string[] => {
      if (!entry.adjustedAutomatically) return [];
      if (!entry.originalDueDate) return [t("expenses.preview.adjustedHint")];

      const parsed = new Date(`${entry.originalDueDate}T00:00:00`);
      const day = parsed.getDay();
      if (day === 0 || day === 6) {
        return [t("expenses.preview.adjustedWeekendHint")];
      }
      return [t("expenses.preview.adjustedHolidayHint")];
    },
    [t],
  );

  React.useEffect(() => {
    if (!open) return;
    setDraftEntries(
      entries.map((entry) => {
        const initialDocument = buildSequentialDocument(baseDocument, entry.order);
        return {
          ...entry,
          document: initialDocument,
          initialDocument,
          initialDueDate: entry.dueDate,
          initialExpectedAmount: entry.expectedAmount,
          systemAdjustments: toSystemAdjustmentMessages(entry),
        };
      }),
    );
  }, [baseDocument, buildSequentialDocument, entries, open, toSystemAdjustmentMessages]);

  const updateEntry = React.useCallback(
    (order: number, patch: Partial<ExpenseBatchReviewDraftEntry>) => {
      setDraftEntries((prev) =>
        prev.map((entry) => (entry.order === order ? { ...entry, ...patch } : entry)),
      );
    },
    [],
  );

  const handleConfirm = React.useCallback(async () => {
    const payload: ExpenseBatchConfirmEntry[] = draftEntries.map((entry) => ({
      order: entry.order,
      dueDate: entry.dueDate,
      expectedAmount: Number(entry.expectedAmount),
    }));
    await onConfirm(payload);
  }, [draftEntries, onConfirm]);

  const adjustmentMessagesForEntry = React.useCallback(
    (entry: ExpenseBatchReviewDraftEntry): string[] => {
      const messages = [...entry.systemAdjustments];
      if (entry.document.trim() !== entry.initialDocument.trim()) {
        messages.push(t("expenses.preview.manualDocumentChanged"));
      }
      if (entry.dueDate !== entry.initialDueDate) {
        messages.push(t("expenses.preview.manualDueDateChanged"));
      }
      if (entry.expectedAmount !== entry.initialExpectedAmount) {
        messages.push(t("expenses.preview.manualAmountChanged"));
      }
      return messages;
    },
    [t],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-hidden">
        <DialogHeader>
          <DialogTitle>{t("expenses.preview.title")}</DialogTitle>
          <DialogDescription>{t("expenses.preview.description")}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-1 rounded-lg border bg-muted/30 p-3 text-sm">
          <p className="text-sm">
            <span className="font-medium">{t("expenses.form.description")}:</span>{" "}
            <span className="text-foreground">{description}</span>
          </p>
          <p className="text-sm">
            <span className="font-medium">{t("expenses.form.category")}:</span>{" "}
            <span className="text-foreground">{categoryName}</span>
            {subCategoryName ? ` / ${subCategoryName}` : ""}
          </p>
          <p className="text-sm">
            <span className="font-medium">{t("expenses.form.amountBehavior")}:</span>{" "}
            {amountBehavior === "FIXED"
              ? t("expenses.form.amountBehavior.fixed")
              : t("expenses.form.amountBehavior.estimated")}
          </p>
          <p className="text-sm">
            <span className="font-medium">{t("expenses.form.amount")}:</span>{" "}
            <span className="tabular-nums">{formatCurrency(baseAmount, currency, intlLocale)}</span>
          </p>
          <p className="text-sm">
            <span className="font-medium">{t("expenses.preview.totalEntries")}:</span>{" "}
            {draftEntries.length}
          </p>
        </div>

        <div className="max-h-[44vh] overflow-auto rounded-lg border">
          <table className="w-full table-fixed text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-xs font-medium text-muted-foreground">
                <th className="w-16 px-2 py-2">{t("expenses.preview.order")}</th>
                <th className="w-[148px] px-2 py-2">{t("expenses.preview.document")}</th>
                <th className="w-[156px] px-2 py-2">{t("expenses.preview.dueDate")}</th>
                <th className="w-[11rem] px-2 py-2 text-center">{t("expenses.preview.amount")}</th>
                <th className="w-[18rem] px-2 py-2">{t("expenses.preview.adjustment")}</th>
              </tr>
            </thead>
            <tbody>
              {draftEntries.map((entry) => {
                const adjustmentMessages = adjustmentMessagesForEntry(entry);
                return (
                <tr
                  key={entry.order}
                  className="border-b border-border/60 last:border-0 hover:bg-muted/20"
                >
                  <td className="px-2 py-2 text-center font-medium tabular-nums">
                    {entry.order}/{draftEntries.length}
                  </td>
                  <td className="px-2 py-2 align-middle">
                    <Input
                      type="text"
                      value={entry.document}
                      onChange={(e) => updateEntry(entry.order, { document: e.target.value })}
                      className="h-9 w-full min-w-0"
                      placeholder={t("expenses.form.documentPlaceholder")}
                    />
                  </td>
                  <td className="px-2 py-2 align-middle">
                    <Input
                      type="date"
                      value={entry.dueDate}
                      onChange={(e) => updateEntry(entry.order, { dueDate: e.target.value })}
                      className="h-9 w-full max-w-[148px] text-center"
                    />
                  </td>
                  <td className="px-2 py-2 align-middle">
                    <MinorUnitMoneyInput
                      value={amountToEditString(entry.expectedAmount, intlLocale)}
                      emptyBlurKeepsValue
                      onChange={(stored) => {
                        const n = parseMoneyInput(stored);
                        updateEntry(entry.order, {
                          expectedAmount: Number.isFinite(n) && n > 0 ? n : entry.expectedAmount,
                        });
                      }}
                      className="mx-auto h-9 w-full max-w-[11rem]"
                    />
                  </td>
                  <td className="px-2 py-2 align-middle">
                    {adjustmentMessages.length ? (
                      <div className="space-y-1">
                        {entry.adjustedAutomatically ? (
                          <Tooltip delayDuration={250}>
                            <TooltipTrigger asChild>
                              <Badge variant="secondary" className="inline-flex items-center gap-1">
                                <CalendarCheck2 className="h-3 w-3" />
                                {t("expenses.preview.adjusted")}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              {entry.originalDueDate
                                ? `${t("expenses.preview.originalDate")}: ${entry.originalDueDate}`
                                : t("expenses.preview.adjustedHint")}
                            </TooltipContent>
                          </Tooltip>
                        ) : null}
                        <ul className="list-disc pl-4 text-xs text-muted-foreground">
                          {adjustmentMessages.map((msg, idx) => (
                            <li key={`${entry.order}-${idx}`}>{msg}</li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {confirmError ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {confirmError}
          </div>
        ) : null}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={confirming}>
            {t("expenses.actions.cancel")}
          </Button>
          <Button type="button" onClick={() => void handleConfirm()} disabled={confirming}>
            {confirming ? t("expenses.actions.creating") : t("expenses.actions.confirmCreate")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
