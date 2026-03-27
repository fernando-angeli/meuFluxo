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
import { Badge } from "@/components/ui/badge";
import { useTranslation, useLocale } from "@/lib/i18n";
import { useAuthOptional } from "@/hooks/useAuth";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CalendarCheck2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ExpenseBatchPreviewModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  description: string;
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

  const [draftEntries, setDraftEntries] = React.useState<ExpenseBatchPreviewEntry[]>([]);
  const [amountDrafts, setAmountDrafts] = React.useState<Partial<Record<number, string>>>({});
  const amountDraftsRef = React.useRef<Partial<Record<number, string>>>({});
  amountDraftsRef.current = amountDrafts;

  React.useEffect(() => {
    if (!open) return;
    setDraftEntries(entries.map((entry) => ({ ...entry })));
    setAmountDrafts({});
    amountDraftsRef.current = {};
  }, [entries, open]);

  const updateEntry = React.useCallback(
    (order: number, patch: Partial<ExpenseBatchPreviewEntry>) => {
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
                <th className="w-14 px-2 py-2">{t("expenses.preview.order")}</th>
                <th className="w-[156px] px-2 py-2">{t("expenses.preview.dueDate")}</th>
                <th className="w-[11rem] px-2 py-2 text-right">{t("expenses.preview.amount")}</th>
                <th className="w-28 px-2 py-2">{t("expenses.preview.adjustment")}</th>
              </tr>
            </thead>
            <tbody>
              {draftEntries.map((entry) => {
                const draft = amountDrafts[entry.order];
                return (
                <tr
                  key={entry.order}
                  className="border-b border-border/60 last:border-0 hover:bg-muted/20"
                >
                  <td className="px-2 py-2 text-center font-medium tabular-nums">{entry.order}</td>
                  <td className="px-2 py-2 align-middle">
                    <Input
                      type="date"
                      value={entry.dueDate}
                      onChange={(e) => updateEntry(entry.order, { dueDate: e.target.value })}
                      className="h-9 w-full max-w-[148px]"
                    />
                  </td>
                  <td className="px-2 py-2 align-middle text-right">
                    <Input
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      value={
                        draft !== undefined
                          ? draft
                          : formatCurrency(entry.expectedAmount, currency, intlLocale)
                      }
                      onFocus={() => {
                        const initial = amountToEditString(entry.expectedAmount, intlLocale);
                        setAmountDrafts((p) => {
                          const next = { ...p, [entry.order]: initial };
                          amountDraftsRef.current = next;
                          return next;
                        });
                      }}
                      onChange={(e) => {
                        const v = e.target.value;
                        setAmountDrafts((p) => {
                          const next = { ...p, [entry.order]: v };
                          amountDraftsRef.current = next;
                          return next;
                        });
                      }}
                      onBlur={() => {
                        const raw = amountDraftsRef.current[entry.order];
                        setAmountDrafts((p) => {
                          if (p[entry.order] === undefined) return p;
                          const next = { ...p };
                          delete next[entry.order];
                          amountDraftsRef.current = next;
                          return next;
                        });
                        if (raw === undefined) return;
                        let nextAmount = 0;
                        if (raw.trim() !== "") {
                          const parsed = parseMoneyInput(raw);
                          nextAmount = Number.isFinite(parsed) ? parsed : entry.expectedAmount;
                        }
                        updateEntry(entry.order, { expectedAmount: nextAmount });
                      }}
                      className={cn(
                        "ml-auto h-9 w-full max-w-[11rem] text-right tabular-nums",
                      )}
                    />
                  </td>
                  <td className="px-2 py-2 align-middle">
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
