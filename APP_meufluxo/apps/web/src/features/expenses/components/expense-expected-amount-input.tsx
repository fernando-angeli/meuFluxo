"use client";

import type { Control, FieldPath, FieldValues } from "react-hook-form";

import { ControlledMinorUnitMoneyInput } from "@/components/form/controlled-minor-unit-money-input";

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

export function ExpenseExpectedAmountInput<T extends FieldValues>(props: ExpenseExpectedAmountInputProps<T>) {
  return <ControlledMinorUnitMoneyInput {...props} />;
}
