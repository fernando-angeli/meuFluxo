"use client";

import * as React from "react";

import { useSidebar } from "./sidebar-context";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function SidebarFooter() {
  const { expanded } = useSidebar();
  const { t } = useTranslation();

  return (
    <footer
      className={cn(
        "border-t border-border/60 px-2 py-3 transition-[width] duration-200",
        !expanded && "flex justify-center",
      )}
    >
      <p
        className={cn(
          "text-[11px] text-muted-foreground",
          !expanded && "text-center",
        )}
      >
        {t("footer.ready")}
      </p>
    </footer>
  );
}
