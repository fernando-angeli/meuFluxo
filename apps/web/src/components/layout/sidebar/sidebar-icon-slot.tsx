"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SidebarIconSlotProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Coluna fixa de ícone da sidebar para manter o mesmo eixo X
 * entre logo, workspace e itens de navegação.
 */
export function SidebarIconSlot({ children, className }: SidebarIconSlotProps) {
  return (
    <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center", className)}>
      {children}
    </span>
  );
}
