"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import { mainNavGroups } from "@/lib/navigation";
import { useTranslation } from "@/lib/i18n";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarNavGroup } from "./sidebar-nav-group";

export function SidebarNav() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    const next: Record<string, boolean> = {};
    for (const group of mainNavGroups) {
      for (const item of group.items) {
        if (!item.children?.length) continue;
        const activeInChildren = item.children.some(
          (child) =>
            pathname === child.href || (pathname?.startsWith(`${child.href}/`) ?? false),
        );
        if (activeInChildren) {
          next[item.href] = true;
        }
      }
    }
    if (Object.keys(next).length === 0) return;
    setExpandedGroups((prev) => ({ ...prev, ...next }));
  }, [pathname]);

  const handleGroupExpandedChange = React.useCallback(
    (href: string, expanded: boolean) => {
      setExpandedGroups((prev) => ({ ...prev, [href]: expanded }));
    },
    [],
  );

  return (
    <ScrollArea className="flex-1 overflow-y-auto overflow-x-hidden">
      <nav
        className="flex flex-col gap-2 px-2 py-3"
        aria-label={t("nav.main")}
      >
        {mainNavGroups.map((group) => (
          <SidebarNavGroup
            key={group.labelKey}
            group={group}
            expandedGroups={expandedGroups}
            onGroupExpandedChange={handleGroupExpandedChange}
          />
        ))}
      </nav>
    </ScrollArea>
  );
}
