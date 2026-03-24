"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type HierarchicalChildPanelProps = {
  /** Rótulo acessível (ex.: "Subcategorias de Moradia"). */
  ariaLabel: string;
  children: React.ReactNode;
  className?: string;
};

/**
 * Container visual para conteúdo filho sob uma linha pai (recuo, borda lateral).
 * Impede clique de propagar para a linha da tabela principal.
 */
export function HierarchicalChildPanel({
  ariaLabel,
  children,
  className,
}: HierarchicalChildPanelProps) {
  return (
    <div
      className={cn(
        "ml-2 border-l-2 border-primary/30 bg-muted/20 pl-4 pr-2 py-3",
        "rounded-r-lg",
        className,
      )}
      onClick={(e) => e.stopPropagation()}
      role="region"
      aria-label={ariaLabel}
    >
      {children}
    </div>
  );
}
