"use client";

import { ChevronDown } from "lucide-react";

import { useSidebar } from "./sidebar-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function WorkspaceSwitcher() {
  const { t } = useTranslation();
  const { expanded } = useSidebar();
  const currentName = t("workspace.label");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex w-full items-center gap-2 rounded-lg border border-transparent px-2 py-2 text-left outline-none transition-colors",
            "hover:bg-accent/60 hover:border-accent",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            expanded ? "min-h-10" : "min-h-9 justify-center px-0",
          )}
          aria-label={t("workspace.switch")}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-medium text-muted-foreground" aria-hidden>
            {currentName.charAt(0).toUpperCase()}
          </div>
          {expanded && (
            <>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-medium text-muted-foreground">{t("workspace.label")}</div>
                <div className="truncate text-sm font-semibold text-foreground">{currentName}</div>
              </div>
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            </>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[--radix-dropdown-menu-trigger-width] min-w-48">
        <DropdownMenuLabel>{t("workspace.list")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>{t("workspace.addSoon")}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
