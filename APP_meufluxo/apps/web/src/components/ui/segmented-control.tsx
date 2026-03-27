"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type SegmentedOption<T extends string> = {
  value: T;
  label: string;
};

type SegmentedControlProps<T extends string> = {
  value: T;
  onChange: (next: T) => void;
  options: readonly SegmentedOption<T>[];
  className?: string;
  /** Ocupa 100% da largura do container */
  fullWidth?: boolean;
  /** Versão mais compacta (ex.: linha com outros campos) */
  size?: "default" | "sm";
  /** Desabilita interação e aplica estilo discreto */
  disabled?: boolean;
  "aria-label"?: string;
  "aria-labelledby"?: string;
};

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  className,
  fullWidth,
  size = "default",
  disabled = false,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      aria-disabled={disabled || undefined}
      className={cn(
        "inline-flex box-border flex-row items-stretch gap-0 overflow-hidden rounded-lg border border-input bg-background shadow-sm",
        "divide-x divide-border/70 dark:divide-border/50",
        "transition-[box-shadow,border-color,opacity]",
        !disabled && "hover:border-primary/40 dark:hover:border-primary/45",
        !disabled && "focus-within:border-primary focus-within:shadow-md",
        "p-0",
        disabled && "pointer-events-none cursor-not-allowed opacity-50",
        fullWidth && "flex w-full min-w-0",
        className,
        size === "sm" ? "h-6 min-h-6" : "h-10 min-h-10",
      )}
    >
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            className={cn(
              "flex min-h-0 min-w-0 flex-1 items-center justify-center rounded-none border-0 text-center font-medium transition-colors",
              "focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/35 dark:focus-visible:ring-primary/45",
              size === "sm"
                ? "px-3 py-0 text-[11px] leading-tight sm:px-3.5 sm:text-xs"
                : "px-4 py-0 text-sm sm:px-5",
              selected
                ? "bg-input font-semibold text-foreground shadow-sm dark:bg-input"
                : "bg-background font-medium text-muted-foreground/50 hover:bg-muted/40 hover:text-muted-foreground/70 dark:text-muted-foreground/45 dark:hover:bg-muted/25 dark:hover:text-muted-foreground/65",
              disabled && "pointer-events-none",
            )}
            onClick={() => {
              if (disabled) return;
              onChange(opt.value);
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
