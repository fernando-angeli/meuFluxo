"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Estado de carregamento em blocos inline (painel expandido, seção secundária). */
export function SectionLoadingState({
  message = "Carregando…",
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-md border bg-card/50 px-3 py-8 text-center text-sm text-muted-foreground",
        className,
      )}
    >
      {message}
    </div>
  );
}

export function SectionEmptyState({
  message,
  className,
}: {
  message: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-md border border-dashed bg-card/40 px-3 py-8 text-center text-sm text-muted-foreground",
        className,
      )}
    >
      {message}
    </div>
  );
}

export function SectionErrorState({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-md border border-destructive/40 bg-destructive/5 px-3 py-3 text-sm text-destructive",
        className,
      )}
    >
      {message}
    </div>
  );
}
