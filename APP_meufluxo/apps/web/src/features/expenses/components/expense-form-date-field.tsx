"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format, isValid, parseISO } from "date-fns";
import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { Controller } from "react-hook-form";

import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { formatIsoDateToDisplay, normalizeExpenseDateInput } from "@/features/expenses/expense-date-parse";

function digitsFromMasked(value: string): string {
  return value.replace(/\D/g, "").slice(0, 8);
}

function applyDateMask(digits: string): string {
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export type ExpenseFormDateFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  id: string;
  className?: string;
  containerClassName?: string;
  inputName?: string;
  fillTodayOnBlurIfEmpty?: boolean;
  disabled?: boolean;
  placeholder?: string;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  autoComplete?: string;
  spellCheck?: boolean;
  autoCorrect?: string;
  autoCapitalize?: string;
  "data-lpignore"?: "true" | "false";
  "data-1p-ignore"?: "true" | "false";
  "data-form-type"?: "other";
  "aria-invalid"?: boolean;
  "aria-labelledby"?: string;
  calendarButtonAriaLabel?: string;
};

export function ExpenseFormDateField<T extends FieldValues>({
  control,
  name,
  id,
  className,
  containerClassName,
  inputName,
  fillTodayOnBlurIfEmpty = false,
  disabled,
  placeholder,
  onFocus,
  autoComplete = "off",
  spellCheck = false,
  autoCorrect = "off",
  autoCapitalize = "none",
  "data-lpignore": dataLpIgnore,
  "data-1p-ignore": data1pIgnore,
  "data-form-type": dataFormType = "other",
  "aria-invalid": ariaInvalid,
  "aria-labelledby": ariaLabelledby,
  calendarButtonAriaLabel = "Abrir calendário",
}: ExpenseFormDateFieldProps<T>) {
  function DateFieldInner({
    field,
  }: {
    field: {
      name: string;
      value: unknown;
      onChange: (value: string) => void;
      onBlur: () => void;
      ref: React.Ref<HTMLInputElement>;
    };
  }) {
    const [calendarOpen, setCalendarOpen] = React.useState(false);
    const [text, setText] = React.useState(() => formatIsoDateToDisplay(String(field.value ?? "")));
    const selectedDate = React.useMemo(() => {
      const normalized = normalizeExpenseDateInput(String(field.value ?? ""));
      if (!normalized) return undefined;
      const parsed = parseISO(normalized);
      return isValid(parsed) ? parsed : undefined;
    }, [field.value]);

    React.useEffect(() => {
      setText(formatIsoDateToDisplay(String(field.value ?? "")));
    }, [field.value]);

    return (
      <div
        className={cn(
          "relative min-h-10 min-w-0 w-full overflow-hidden rounded-lg",
          containerClassName,
        )}
      >
        <Input
          ref={field.ref}
          id={id}
          name={inputName ?? field.name}
          type="text"
          inputMode="numeric"
          autoComplete={autoComplete}
          spellCheck={spellCheck}
          autoCorrect={autoCorrect}
          autoCapitalize={autoCapitalize}
          data-lpignore={dataLpIgnore}
          data-1p-ignore={data1pIgnore}
          data-form-type={dataFormType}
          disabled={disabled}
          placeholder={placeholder}
          aria-invalid={ariaInvalid}
          aria-labelledby={ariaLabelledby}
          className={cn("box-border h-full min-h-10 w-full min-w-0 pr-14", className)}
          value={text}
          onChange={(e) => {
            const raw = e.target.value;
            const trimmed = raw.trim();
            if (trimmed.includes("-")) {
              const iso = normalizeExpenseDateInput(trimmed);
              if (iso) {
                setText(formatIsoDateToDisplay(iso));
                field.onChange(iso);
                return;
              }
            }
            const next = applyDateMask(digitsFromMasked(raw));
            setText(next);
          }}
          onFocus={(e) => {
            onFocus?.(e);
          }}
          onBlur={() => {
            const trimmed = text.trim();
            if (!trimmed) {
              if (fillTodayOnBlurIfEmpty) {
                const todayIso = format(new Date(), "yyyy-MM-dd");
                field.onChange(todayIso);
                setText(formatIsoDateToDisplay(todayIso));
                field.onBlur();
                return;
              }
              field.onChange("");
              field.onBlur();
              return;
            }
            const iso = normalizeExpenseDateInput(trimmed);
            field.onChange(iso ?? trimmed);
            setText(iso ? formatIsoDateToDisplay(iso) : trimmed);
            field.onBlur();
          }}
        />
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              tabIndex={-1}
              disabled={disabled}
              aria-label={calendarButtonAriaLabel}
              className="absolute right-1 top-1/2 z-10 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              <CalendarIcon className="h-4 w-4" aria-hidden />
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0"
            align="start"
            sideOffset={8}
            onOpenAutoFocus={(event) => event.preventDefault()}
          >
            <div className="rounded-lg border bg-popover shadow-lg">
              <Calendar
                mode="single"
                selected={selectedDate}
                defaultMonth={selectedDate ?? new Date()}
                onSelect={(nextDate) => {
                  if (!nextDate) return;
                  const iso = format(nextDate, "yyyy-MM-dd");
                  field.onChange(iso);
                  setText(formatIsoDateToDisplay(iso));
                  setCalendarOpen(false);
                }}
                numberOfMonths={1}
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => <DateFieldInner field={field} />}
    />
  );
}
