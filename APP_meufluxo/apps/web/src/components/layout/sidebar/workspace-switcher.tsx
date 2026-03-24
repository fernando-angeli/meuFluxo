"use client";

import { ChevronDown } from "lucide-react";

import { useSidebar } from "./sidebar-context";
import { SidebarIconSlot } from "./sidebar-icon-slot";
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
            "flex h-10 w-full items-center rounded-lg border border-transparent px-2 text-left outline-none transition-colors",
            "hover:bg-accent/60 hover:border-accent",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "justify-start",
          )}
          aria-label={t("workspace.switch")}
        >
          <SidebarIconSlot>
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-sm font-medium text-muted-foreground"
              aria-hidden
            >
              {currentName.charAt(0).toUpperCase()}
            </div>
          </SidebarIconSlot>
          <div
            className={cn(
              "ml-2 min-w-0 flex-1 overflow-hidden whitespace-nowrap transition-all duration-200 ease-in-out",
              expanded ? "max-w-[180px] opacity-100" : "max-w-0 opacity-0",
            )}
            aria-hidden={!expanded}
          >
            <div className="truncate text-xs font-medium leading-4 text-muted-foreground">
              {t("workspace.label")}
            </div>
            <div className="truncate text-sm font-semibold leading-5 text-foreground">{currentName}</div>
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-muted-foreground transition-opacity duration-200",
              expanded ? "opacity-100" : "opacity-0",
            )}
            aria-hidden={!expanded}
          />
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
