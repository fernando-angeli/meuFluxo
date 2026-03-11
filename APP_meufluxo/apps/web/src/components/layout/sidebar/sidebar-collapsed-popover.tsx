"use client";

import * as React from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/**
 * Popover lateral usado no modo recolhido quando um grupo possui subitens.
 * Ao clicar no ícone do grupo, abre este popover ao lado com os subitens.
 * Hoje o menu não tem submenus; este componente fica disponível para uso futuro.
 */
type SidebarCollapsedPopoverProps = {
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function SidebarCollapsedPopover({
  trigger,
  children,
  className,
}: SidebarCollapsedPopoverProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        sideOffset={8}
        className={cn("w-52 p-1", className)}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {children}
      </PopoverContent>
    </Popover>
  );
}
