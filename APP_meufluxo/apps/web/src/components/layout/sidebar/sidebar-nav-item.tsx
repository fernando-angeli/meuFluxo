"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";

import type { NavItem } from "@/lib/navigation";
import { useTranslation } from "@/lib/i18n";
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
  const Icon = item.icon;
  const title = t(item.titleKey);
  const children = item.children ?? [];
  const hasChildren = children.length > 0;
  const firstChildHref = children[0]?.href;
  const href = item.href ?? firstChildHref ?? "#";

  const hasMatchingPath = React.useCallback(
    (target: string) =>
      pathname === target || (pathname?.startsWith(`${target}/`) ?? false),
    [pathname],
  );
  const activeSelf = item.href ? hasMatchingPath(item.href) : false;
  const activeChild = children.some((child) => hasMatchingPath(child.href));
  const active = activeSelf || activeChild;
  const submenuId = `submenu-${item.titleKey.replace(/\./g, "-")}`;

  const [submenuOpen, setSubmenuOpen] = React.useState(active);
  React.useEffect(() => {
    if (!hasChildren) return;
    if (active) setSubmenuOpen(true);
  }, [active, hasChildren]);

  const rowContent = (
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
          "min-w-0 flex-1 overflow-hidden whitespace-nowrap transition-all duration-200 ease-in-out",
          collapsed ? "max-w-0 opacity-0" : "max-w-[160px] pl-2 opacity-100",
        )}
      >
        <span className="truncate">{title}</span>
      </span>
      {!collapsed && hasChildren ? (
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
            submenuOpen ? "rotate-180" : "rotate-0",
          )}
          aria-hidden
        />
      ) : null}
    </span>
  );

  const submenu = !collapsed && hasChildren ? (
    <div
      className={cn(
        "grid overflow-hidden transition-all duration-200 ease-in-out",
        submenuOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
      )}
    >
      <ul className="min-h-0 space-y-0.5 overflow-hidden py-1" role="list">
        {children.map((child) => {
          const childActive = hasMatchingPath(child.href);
          return (
            <li key={child.href}>
              <Link href={child.href} className="block">
                <span
                  className={cn(
                    "flex h-9 items-center rounded-lg pl-12 pr-2 text-sm transition-colors",
                    childActive
                      ? "bg-accent text-foreground shadow-[inset_2px_0_0_0_hsl(var(--primary))]"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <span className="truncate">{t(child.titleKey)}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  ) : null;

  if (collapsed) {
    return (
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <Link href={href} className="block">
            {rowContent}
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {title}
        </TooltipContent>
      </Tooltip>
    );
  }

  if (hasChildren) {
    return (
      <div>
        <button
          type="button"
          className="block w-full text-left"
          onClick={() => setSubmenuOpen((prev) => !prev)}
          aria-expanded={submenuOpen}
          aria-controls={submenuId}
        >
          {rowContent}
        </button>
        <div id={submenuId}>{submenu}</div>
      </div>
    );
  }

  return <Link href={href} className="block">{rowContent}</Link>;
}
