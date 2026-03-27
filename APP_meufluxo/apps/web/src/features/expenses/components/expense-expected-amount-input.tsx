"use client";

import * as React from "react";
import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";

import {
  amountToEditString,
  formatCurrency,
  intlLocaleFromAppLocale,
  parseMoneyInput,
  resolveWalletCurrency,
} from "@meufluxo/utils";
import { Input } from "@/components/ui/input";
import { useAuthOptional } from "@/hooks/useAuth";
import { useLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

function sanitizeMoneyTyping(raw: string): string {
  return raw.replace(/[^\d.,]/g, "");
}

function formatStoredForDisplay(value: string, currency: "BRL" | "USD" | "EUR", intlLocale: string): string {
  if (!value.trim()) return "";
  const n = parseMoneyInput(value);
  if (!Number.isFinite(n) || n <= 0) return "";
  return formatCurrency(n, currency, intlLocale);
}

type ExpenseExpectedAmountInputProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  id: string;
  className?: string;
  disabled?: boolean;
  "aria-invalid"?: boolean;
};

export function ExpenseExpectedAmountInput<T extends FieldValues>({
  control,
  name,
  id,
  className,
  disabled,
  "aria-invalid": ariaInvalid,
}: ExpenseExpectedAmountInputProps<T>) {
  const auth = useAuthOptional();
  const { locale: appLocale } = useLocale();
  const currency = resolveWalletCurrency(auth?.preferences?.currency);
  const intlLocale = intlLocaleFromAppLocale(appLocale);

  const [focused, setFocused] = React.useState(false);
  const [draft, setDraft] = React.useState("");
  const editingRef = React.useRef(false);
  const draftRef = React.useRef("");

  return (
    <Controller
      control={control}
      name={name}
      disabled={disabled}
      render={({ field }) => {
        const blurredDisplay = formatStoredForDisplay(
          typeof field.value === "string" ? field.value : String(field.value ?? ""),
          currency,
          intlLocale,
        );

        return (
          <Input
            id={id}
            ref={field.ref}
            name={field.name}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            disabled={field.disabled}
            aria-invalid={ariaInvalid}
            className={cn("text-right tabular-nums", className)}
            value={focused ? draft : blurredDisplay}
            onFocus={() => {
              editingRef.current = true;
              setFocused(true);
              const raw = typeof field.value === "string" ? field.value : String(field.value ?? "");
              if (!raw.trim()) {
                draftRef.current = "";
                setDraft("");
                return;
              }
              const n = parseMoneyInput(raw);
              const nextDraft = Number.isFinite(n) && n > 0 ? amountToEditString(n, intlLocale) : "";
              draftRef.current = nextDraft;
              setDraft(nextDraft);
            }}
            onChange={(e) => {
              if (!editingRef.current) return;
              const next = sanitizeMoneyTyping(e.target.value);
              draftRef.current = next;
              setDraft(next);
            }}
            onBlur={() => {
              if (editingRef.current) {
                const nextRaw = sanitizeMoneyTyping(draftRef.current);
                if (!nextRaw.trim()) {
                  field.onChange("");
                } else {
                  const parsed = parseMoneyInput(nextRaw);
                  field.onChange(String(Number.isFinite(parsed) ? parsed : 0));
                }
              }
              editingRef.current = false;
              draftRef.current = "";
              field.onBlur();
              setFocused(false);
              setDraft("");
            }}
          />
        );
      }}
    />
  );
}
