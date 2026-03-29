"use client";

import * as React from "react";
import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";

import { MinorUnitMoneyInput } from "@/components/ui/minor-unit-money-input";

type ExpenseExpectedAmountInputProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  id: string;
  className?: string;
  disabled?: boolean;
  autoComplete?: string;
  spellCheck?: boolean;
  autoCorrect?: string;
  autoCapitalize?: string;
  "data-lpignore"?: "true" | "false";
  "data-1p-ignore"?: "true" | "false";
  "data-form-type"?: "other";
  "aria-invalid"?: boolean;
};

export function ExpenseExpectedAmountInput<T extends FieldValues>({
  control,
  name,
  id,
  className,
  disabled,
  autoComplete = "off",
  spellCheck = false,
  autoCorrect = "off",
  autoCapitalize = "none",
  "data-lpignore": dataLpIgnore,
  "data-1p-ignore": data1pIgnore,
  "data-form-type": dataFormType = "other",
  "aria-invalid": ariaInvalid,
}: ExpenseExpectedAmountInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      disabled={disabled}
      render={({ field }) => (
        <MinorUnitMoneyInput
          id={id}
          ref={field.ref}
          name={field.name}
          value={typeof field.value === "string" ? field.value : String(field.value ?? "")}
          onChange={field.onChange}
          onBlur={field.onBlur}
          disabled={field.disabled}
          autoComplete={autoComplete}
          spellCheck={spellCheck}
          autoCorrect={autoCorrect}
          autoCapitalize={autoCapitalize}
          data-lpignore={dataLpIgnore}
          data-1p-ignore={data1pIgnore}
          data-form-type={dataFormType}
          aria-invalid={ariaInvalid}
          className={className}
        />
      )}
    />
  );
}
