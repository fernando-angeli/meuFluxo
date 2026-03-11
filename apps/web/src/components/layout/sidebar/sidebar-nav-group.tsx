"use client";

import * as React from "react";

import type { NavGroup } from "@/lib/navigation";
import { useTranslation } from "@/lib/i18n";
import { SidebarNavItem } from "./sidebar-nav-item";
import { useSidebar } from "./sidebar-context";
import { cn } from "@/lib/utils";

type SidebarNavGroupProps = {
  group: NavGroup;
};

export function SidebarNavGroup({ group }: SidebarNavGroupProps) {
  const { expanded } = useSidebar();
  const { t } = useTranslation();

  return (
    <div className="space-y-0.5">
      {expanded && (
        <div
          className="px-2 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground"
          role="presentation"
        >
          {t(group.labelKey)}
        </div>
      )}
      <ul className="space-y-0.5" role="list">
        {group.items.map((item) => (
          <li key={item.href}>
            <SidebarNavItem item={item} collapsed={!expanded} />
          </li>
        ))}
      </ul>
    </div>
  );
}
