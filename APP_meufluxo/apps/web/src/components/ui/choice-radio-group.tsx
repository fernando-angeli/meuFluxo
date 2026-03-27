"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type ChoiceRadioOption<T extends string> = {
  value: T;
  title: string;
  description: string;
};

type ChoiceRadioGroupProps<T extends string> = {
  value: T;
  onChange: (next: T) => void;
  options: readonly ChoiceRadioOption<T>[];
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
};

export function ChoiceRadioGroup<T extends string>({
  value,
  onChange,
  options,
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
}: ChoiceRadioGroupProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      className={cn("space-y-2", className)}
    >
      {options.map((opt) => {
        const checked = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={checked}
            onClick={() => onChange(opt.value)}
            className={cn(
              "group flex w-full items-start gap-3 rounded-md px-1 py-1 text-left transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:focus-visible:ring-primary/45",
              "hover:text-foreground",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                checked ? "border-primary" : "border-muted-foreground/60",
              )}
            >
              <span
                className={cn(
                  "h-2 w-2 rounded-full bg-primary transition-opacity",
                  checked ? "opacity-100" : "opacity-0",
                )}
              />
            </span>
            <span className="min-w-0">
              <span className={cn("block text-sm", checked ? "font-semibold text-foreground" : "font-medium text-foreground")}>
                {opt.title}
              </span>
              <span className="block text-xs text-muted-foreground">{opt.description}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

