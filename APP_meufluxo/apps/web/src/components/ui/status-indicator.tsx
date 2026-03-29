"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type StatusTone = "positive" | "warning" | "critical" | "neutral" | "info";

const toneClassName: Record<StatusTone, string> = {
  positive: "bg-emerald-500",
  warning: "bg-amber-500",
  critical: "bg-rose-500",
  neutral: "bg-slate-400",
  info: "bg-sky-500",
};

export function StatusIndicator({
  label,
  tone,
  className,
}: {
  label: string;
  tone: StatusTone;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-sm text-foreground", className)}>
      <span
        className={cn(
          "inline-block h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-background",
          toneClassName[tone],
        )}
        aria-hidden
      />
      <span className="truncate">{label}</span>
    </span>
  );
}

