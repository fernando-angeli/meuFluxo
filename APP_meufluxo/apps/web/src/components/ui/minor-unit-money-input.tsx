"use client";

import * as React from "react";

import {
  MAX_MINOR_UNIT_MONEY_DIGITS,
  amountFromMinorUnitDigits,
  amountToEditString,
  formatCurrency,
  formatCurrencyFromMinorUnitDigits,
  intlLocaleFromAppLocale,
  minorUnitDigitsFromAmount,
  parseMoneyInput,
  resolveWalletCurrency,
} from "@meufluxo/utils";
import { Input } from "@/components/ui/input";
import { useAuthOptional } from "@/hooks/useAuth";
import { useLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type MinorUnitMoneyInputProps = Omit<
  React.ComponentProps<typeof Input>,
  "type" | "value" | "onChange" | "inputMode" | "onBeforeInput"
> & {
  /** Valor persistido (string interpretável por parseMoneyInput). */
  value: string;
  onChange: (stored: string) => void;
  /** Se true, blur com campo vazio não chama onChange (mantém valor do pai). */
  emptyBlurKeepsValue?: boolean;
};

/**
 * Campo de moeda: só dígitos, sempre como centavos (150 → 1,50; 15000 → 150,00).
 */
export const MinorUnitMoneyInput = React.forwardRef<HTMLInputElement, MinorUnitMoneyInputProps>(
  function MinorUnitMoneyInput(
    { value, onChange, onBlur, onFocus, className, disabled, emptyBlurKeepsValue = false, ...rest },
    ref,
  ) {
    const auth = useAuthOptional();
    const { locale: appLocale } = useLocale();
    const currency = resolveWalletCurrency(auth?.preferences?.currency);
    const intlLocale = intlLocaleFromAppLocale(appLocale);

    const [focused, setFocused] = React.useState(false);
    const [minorDigits, setMinorDigits] = React.useState("");
    const minorDigitsRef = React.useRef("");
    const editingRef = React.useRef(false);

    const blurredDisplay = React.useMemo(() => {
      const n = parseMoneyInput(typeof value === "string" ? value : String(value ?? ""));
      if (!Number.isFinite(n) || n <= 0) return "";
      return formatCurrency(n, currency, intlLocale);
    }, [value, currency, intlLocale]);

    const focusedDisplay = minorDigits
      ? formatCurrencyFromMinorUnitDigits(minorDigits, currency, intlLocale)
      : "";

    return (
      <Input
        {...rest}
        ref={ref}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        disabled={disabled}
        className={cn("text-center tabular-nums", className)}
        value={focused ? focusedDisplay : blurredDisplay}
        onFocus={(e) => {
          editingRef.current = true;
          setFocused(true);
          const raw = typeof value === "string" ? value : String(value ?? "");
          let digits = "";
          if (raw.trim()) {
            const n = parseMoneyInput(raw);
            if (Number.isFinite(n) && n > 0) {
              digits = minorUnitDigitsFromAmount(n);
            }
          }
          minorDigitsRef.current = digits;
          setMinorDigits(digits);
          requestAnimationFrame(() => {
            const el = e.currentTarget;
            const len = el.value.length;
            el.setSelectionRange(len, len);
          });
          onFocus?.(e);
        }}
        onBeforeInput={(e) => {
          if (!editingRef.current || disabled) return;
          const ie = e.nativeEvent as InputEvent;
          const el = e.currentTarget;
          const selStart = el.selectionStart ?? 0;
          const selEnd = el.selectionEnd ?? 0;
          const val = el.value;

          if (ie.inputType === "insertText" && ie.data) {
            const only = ie.data.replace(/\D/g, "");
            if (!only) return;
            e.preventDefault();
            const fullSelection = selStart !== selEnd && selStart === 0 && selEnd === val.length;
            setMinorDigits((d) => {
              const base = fullSelection ? "" : d;
              const next = (base + only).slice(0, MAX_MINOR_UNIT_MONEY_DIGITS);
              minorDigitsRef.current = next;
              return next;
            });
            requestAnimationFrame(() => {
              const len = el.value.length;
              el.setSelectionRange(len, len);
            });
            return;
          }

          if (ie.inputType === "deleteContentBackward") {
            e.preventDefault();
            if (selStart !== selEnd && selStart === 0 && selEnd === val.length) {
              minorDigitsRef.current = "";
              setMinorDigits("");
            } else {
              setMinorDigits((d) => {
                const next = d.slice(0, -1);
                minorDigitsRef.current = next;
                return next;
              });
            }
            requestAnimationFrame(() => {
              const len = el.value.length;
              el.setSelectionRange(len, len);
            });
          }
        }}
        onPaste={(e) => {
          if (!editingRef.current || disabled) return;
          e.preventDefault();
          const text = e.clipboardData.getData("text");
          const only = text.replace(/\D/g, "").slice(0, MAX_MINOR_UNIT_MONEY_DIGITS);
          minorDigitsRef.current = only;
          setMinorDigits(only);
          const el = e.currentTarget;
          requestAnimationFrame(() => {
            const len = el.value.length;
            el.setSelectionRange(len, len);
          });
        }}
        onChange={(e) => {
          if (!editingRef.current || disabled) return;
          const nextDigits = e.currentTarget.value.replace(/\D/g, "").slice(0, MAX_MINOR_UNIT_MONEY_DIGITS);
          minorDigitsRef.current = nextDigits;
          setMinorDigits(nextDigits);
        }}
        onBlur={(e) => {
          if (editingRef.current) {
            const digits = minorDigitsRef.current;
            if (!digits) {
              if (!emptyBlurKeepsValue) {
                onChange("");
              }
            } else {
              const amount = amountFromMinorUnitDigits(digits);
              if (amount > 0) {
                onChange(amountToEditString(amount, intlLocale));
              } else if (!emptyBlurKeepsValue) {
                onChange("");
              }
            }
          }
          editingRef.current = false;
          minorDigitsRef.current = "";
          setFocused(false);
          setMinorDigits("");
          onBlur?.(e);
        }}
      />
    );
  },
);

MinorUnitMoneyInput.displayName = "MinorUnitMoneyInput";
