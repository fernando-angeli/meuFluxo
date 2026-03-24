"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import type { NavItem } from "@/lib/navigation";
import { useTranslation } from "@/lib/i18n";
import { useSidebar } from "./sidebar-context";
import { SidebarIconSlot } from "./sidebar-icon-slot";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type SidebarNavItemProps = {
  item: NavItem;
  /** Quando true (menu recolhido), mostra só ícone e usa tooltip. */
  collapsed?: boolean;
};

export function SidebarNavItem({ item, collapsed }: SidebarNavItemProps) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { setExpanded } = useSidebar();
  const active = pathname === item.href;
  const Icon = item.icon;
  const title = t(item.titleKey);

  const handleClick = React.useCallback(() => {
    if (collapsed) setExpanded(true);
  }, [collapsed, setExpanded]);

  const linkContent = (
    <span
      className={cn(
        "flex h-10 items-center rounded-lg px-2 text-sm transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        active
          ? "bg-accent text-foreground shadow-[inset_2px_0_0_0_hsl(var(--primary))]"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
    >
      <span aria-hidden>
        <SidebarIconSlot className="h-8 w-8">
          <Icon className="h-4 w-4" />
        </SidebarIconSlot>
      </span>
      <span
        className={cn(
          "min-w-0 overflow-hidden whitespace-nowrap pl-2 transition-all duration-200 ease-in-out",
          collapsed ? "max-w-0 opacity-0" : "max-w-[160px] opacity-100",
        )}
      >
        <span className="truncate">{title}</span>
      </span>
    </span>
  );

  if (collapsed) {
    return (
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <Link href={item.href} className="block" onClick={handleClick}>
            {linkContent}
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {title}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Link href={item.href} className="block" onClick={handleClick}>
      {linkContent}
    </Link>
  );
}
