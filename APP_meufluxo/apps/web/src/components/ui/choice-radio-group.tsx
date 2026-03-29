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
  disabled?: boolean;
  "aria-label"?: string;
  "aria-labelledby"?: string;
};

export function ChoiceRadioGroup<T extends string>({
  value,
  onChange,
  options,
  className,
  disabled = false,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
}: ChoiceRadioGroupProps<T>) {
  const buttonRefs = React.useRef<Array<HTMLButtonElement | null>>([]);
  const selectedIndex = options.findIndex((opt) => opt.value === value);
  const fallbackIndex = selectedIndex >= 0 ? selectedIndex : 0;

  const moveSelection = React.useCallback(
    (direction: 1 | -1) => {
      if (disabled || options.length === 0) return;
      const nextIndex = (fallbackIndex + direction + options.length) % options.length;
      const nextValue = options[nextIndex]?.value;
      if (!nextValue) return;
      onChange(nextValue);
      requestAnimationFrame(() => {
        buttonRefs.current[nextIndex]?.focus();
      });
    },
    [disabled, fallbackIndex, onChange, options],
  );

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      aria-disabled={disabled || undefined}
      className={cn("space-y-2", className)}
    >
      {options.map((opt, index) => {
        const checked = opt.value === value;
        return (
          <button
            key={opt.value}
            ref={(node) => {
              buttonRefs.current[index] = node;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            disabled={disabled}
            tabIndex={disabled ? -1 : checked ? 0 : -1}
            onClick={() => onChange(opt.value)}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                event.preventDefault();
                moveSelection(1);
                return;
              }
              if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                event.preventDefault();
                moveSelection(-1);
              }
            }}
            className={cn(
              "group flex w-full items-start gap-3 rounded-md px-1 py-1 text-left transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:focus-visible:ring-primary/45",
              "hover:text-foreground",
              disabled && "pointer-events-none opacity-60",
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

