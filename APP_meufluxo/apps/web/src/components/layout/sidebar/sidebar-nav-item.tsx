"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";

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
  /** Estado controlado de expansão para itens com submenus. */
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
};

function getSubmenuTone(href: string) {
  if (href.startsWith("/income")) {
    return {
      container: "border-emerald-500/35 bg-emerald-500/5 dark:bg-emerald-500/10",
      parent:
        "bg-emerald-500/14 text-emerald-800 hover:bg-emerald-500/18 dark:text-emerald-200 dark:bg-emerald-500/18 dark:hover:bg-emerald-500/24",
      child:
        "text-emerald-800 hover:bg-emerald-500/10 dark:text-emerald-200 dark:hover:bg-emerald-500/16",
      childActive:
        "bg-emerald-500/18 text-emerald-900 dark:bg-emerald-500/28 dark:text-emerald-50",
    };
  }
  if (href.startsWith("/expenses")) {
    return {
      container: "border-rose-500/35 bg-rose-500/5 dark:bg-rose-500/10",
      parent:
        "bg-rose-500/14 text-rose-800 hover:bg-rose-500/18 dark:text-rose-200 dark:bg-rose-500/18 dark:hover:bg-rose-500/24",
      child:
        "text-rose-800 hover:bg-rose-500/10 dark:text-rose-200 dark:hover:bg-rose-500/16",
      childActive:
        "bg-rose-500/18 text-rose-900 dark:bg-rose-500/28 dark:text-rose-50",
    };
  }
  return {
    container: "border-primary/25 bg-primary/5 dark:bg-primary/10",
    parent:
      "bg-primary/15 text-foreground hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/25",
    child: "text-foreground/90 hover:bg-primary/10 dark:hover:bg-primary/15",
    childActive: "bg-primary/18 text-foreground dark:bg-primary/25",
  };
}

export function SidebarNavItem({
  item,
  collapsed,
  expanded = false,
  onExpandedChange,
}: SidebarNavItemProps) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { setExpanded } = useSidebar();
  const hasChildren = (item.children?.length ?? 0) > 0;
  const childActive =
    item.children?.some(
      (child) =>
        pathname === child.href || (pathname?.startsWith(`${child.href}/`) ?? false),
    ) ?? false;
  const parentActive =
    pathname === item.href ||
    (pathname?.startsWith(`${item.href}/`) ?? false);
  const active = parentActive || childActive;
  const Icon = item.icon;
  const title = t(item.titleKey);
  const tones = getSubmenuTone(item.href);

  const handleSimpleItemClick = React.useCallback(() => {
    if (collapsed) setExpanded(true);
  }, [collapsed, setExpanded]);

  const handleToggleChildren = React.useCallback(() => {
    if (!hasChildren) return;
    if (collapsed) setExpanded(true);
    onExpandedChange?.(!expanded);
  }, [collapsed, expanded, hasChildren, onExpandedChange, setExpanded]);

  const parentContent = (
    <span
      className={cn(
        "flex h-10 items-center rounded-lg px-2 text-sm transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        hasChildren
          ? cn(
              tones.parent,
              active && "shadow-[inset_2px_0_0_0_hsl(var(--primary))] ring-1 ring-primary/20",
            )
          : active
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
          "min-w-0 overflow-hidden whitespace-nowrap transition-all duration-200 ease-in-out",
          collapsed ? "max-w-0 opacity-0" : "max-w-[160px] pl-2 opacity-100",
        )}
      >
        <span className="truncate">{title}</span>
      </span>
      {hasChildren && !collapsed ? (
        <ChevronDown
          className={cn(
            "ml-auto h-4 w-4 shrink-0 transition-transform duration-200",
            expanded ? "rotate-180" : "rotate-0",
          )}
        />
      ) : null}
    </span>
  );

  if (!hasChildren) {
    if (collapsed) {
      return (
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <Link href={item.href} className="block" onClick={handleSimpleItemClick}>
              {parentContent}
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            {title}
          </TooltipContent>
        </Tooltip>
      );
    }

    return (
      <Link href={item.href} className="block" onClick={handleSimpleItemClick}>
        {parentContent}
      </Link>
    );
  }

  const submenuBlock = (
    <div
      className={cn(
        "rounded-lg border p-1 transition-all duration-200",
        tones.container,
        active && "shadow-sm",
      )}
    >
      <button
        type="button"
        onClick={handleToggleChildren}
        className="w-full text-left"
        aria-expanded={expanded}
        aria-controls={`submenu-${item.href.replace(/\W+/g, "-")}`}
      >
        {parentContent}
      </button>

      {expanded && !collapsed ? (
        <ul
          id={`submenu-${item.href.replace(/\W+/g, "-")}`}
          className="mt-1 space-y-0.5 border-t border-current/15 pt-1"
        >
          {item.children?.map((child) => {
            const isChildActive =
              pathname === child.href || (pathname?.startsWith(`${child.href}/`) ?? false);
            return (
              <li key={child.href}>
                <Link
                  href={child.href}
                  className={cn(
                    "block rounded-md px-3 py-2 pl-9 text-sm transition-colors",
                    tones.child,
                    isChildActive && tones.childActive,
                  )}
                >
                  {t(child.titleKey)}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );

  if (collapsed) {
    return (
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <button type="button" className="block w-full text-left" onClick={handleToggleChildren}>
            {parentContent}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {title}
        </TooltipContent>
      </Tooltip>
    );
  }

  return submenuBlock;
}
