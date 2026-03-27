"use client";

import * as React from "react";

import { mainNavGroups } from "@/lib/navigation";
import { useTranslation } from "@/lib/i18n";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarNavGroup } from "./sidebar-nav-group";

export function SidebarNav() {
  const { t } = useTranslation();

  return (
    <ScrollArea className="flex-1 overflow-y-auto overflow-x-hidden">
      <nav
        className="flex flex-col gap-2 px-2 py-3"
        aria-label={t("nav.main")}
      >
        {mainNavGroups.map((group) => (
          <SidebarNavGroup key={group.labelKey} group={group} />
        ))}
      </nav>
    </ScrollArea>
  );
}
