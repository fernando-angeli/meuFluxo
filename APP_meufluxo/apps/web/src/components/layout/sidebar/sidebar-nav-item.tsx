"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import type { NavItem } from "@/lib/navigation";
import { useTranslation } from "@/lib/i18n";
import { useSidebar } from "./sidebar-context";
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
        "flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
        collapsed && "justify-center px-2",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      {!collapsed && <span className="truncate">{title}</span>}
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
