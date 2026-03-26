"use client";

import * as React from "react";

import type { NavGroup } from "@/lib/navigation";
import { useTranslation } from "@/lib/i18n";
import { SidebarNavItem } from "./sidebar-nav-item";
import { useSidebar } from "./sidebar-context";

type SidebarNavGroupProps = {
  group: NavGroup;
  expandedGroups: Record<string, boolean>;
  onGroupExpandedChange: (href: string, expanded: boolean) => void;
};

export function SidebarNavGroup({
  group,
  expandedGroups,
  onGroupExpandedChange,
}: SidebarNavGroupProps) {
  const { expanded } = useSidebar();
  const { t } = useTranslation();

  return (
    <section
      className="rounded-xl border border-border/40 bg-muted/20 p-1.5 dark:bg-muted/10"
      aria-label={t(group.labelKey)}
    >
      <ul className="space-y-0.5" role="list">
        {group.items.map((item) => (
          <li key={item.href}>
            <SidebarNavItem
              item={item}
              collapsed={!expanded}
              expanded={!!expandedGroups[item.href]}
              onExpandedChange={(next) => onGroupExpandedChange(item.href, next)}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
