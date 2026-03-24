"use client";

import type { MouseEvent } from "react";
import type { LucideIcon } from "lucide-react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type RowActionButtonItem = {
  key: string;
  /** Texto do tooltip */
  label: string;
  icon: LucideIcon;
  onClick: (e: MouseEvent) => void;
  disabled?: boolean;
  ariaLabel: string;
  iconClassName?: string;
  buttonClassName?: string;
};

type RowActionButtonsProps = {
  actions: RowActionButtonItem[];
  /** `compact`: ícones menores (linhas filhas / mini-tabelas). */
  density?: "default" | "compact";
  /** Ex.: `gap-2` para alinhar com telas legadas (contas). */
  className?: string;
};

const densityStyles = {
  default: {
    gap: "gap-1",
    icon: "h-4 w-4",
    button: "",
  },
  compact: {
    gap: "gap-1",
    icon: "h-3.5 w-3.5",
    button: "h-8 w-8",
  },
} as const;

/**
 * Ações por linha (ícone + tooltip), com stopPropagation para uso em tabelas clicáveis.
 */
export function RowActionButtons({
  actions,
  density = "default",
  className,
}: RowActionButtonsProps) {
  const d = densityStyles[density];

  return (
    <div className={cn("flex items-center justify-end", d.gap, className)}>
      {actions.map((a) => {
        const Icon = a.icon;
        return (
          <Tooltip key={a.key}>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(d.button, a.buttonClassName)}
                aria-label={a.ariaLabel}
                disabled={a.disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  a.onClick(e);
                }}
              >
                <Icon className={cn(d.icon, a.iconClassName)} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{a.label}</TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
