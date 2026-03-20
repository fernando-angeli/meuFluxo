"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type SwitchProps = {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
};

export function Switch({
  checked,
  onCheckedChange,
  disabled,
  className,
  "aria-label": ariaLabel,
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      tabIndex={0}
      onClick={() => {
        if (disabled) return;
        onCheckedChange?.(!checked);
      }}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onCheckedChange?.(!checked);
        }
      }}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full border border-transparent transition-colors",
        "bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "data-[checked=true]:bg-primary",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      data-checked={checked ? "true" : "false"}
    >
      <span
        className={cn(
          "pointer-events-none block h-5 w-5 translate-x-0.5 rounded-full bg-background shadow-lg ring-1 ring-border transition-transform",
          checked && "translate-x-5",
        )}
      />
    </button>
  );
}

