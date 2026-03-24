"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type PanelSectionHeaderProps = {
  title: string;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
};

/**
 * Cabeçalho de seção inline (título + subtítulo opcional + ação à direita).
 */
export function PanelSectionHeader({
  title,
  subtitle,
  action,
  className,
}: PanelSectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-3 flex flex-wrap items-center justify-between gap-2",
        className,
      )}
    >
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        {subtitle != null ? (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {action != null ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
