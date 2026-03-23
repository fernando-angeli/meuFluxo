"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function DetailsSection({
  title,
  description,
  children,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-xl border bg-card/30 p-4", className)}>
      <header className="mb-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      </header>
      <div className="space-y-2">{children}</div>
    </section>
  );
}
