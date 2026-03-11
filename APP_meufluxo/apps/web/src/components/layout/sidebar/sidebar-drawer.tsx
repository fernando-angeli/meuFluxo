"use client";

import * as React from "react";
import { X } from "lucide-react";

import { useSidebar, SidebarInDrawerContext } from "./sidebar-context";
import { SidebarContent } from "./sidebar-content";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

function SidebarDrawerInner() {
  const { t } = useTranslation();
  const { mobileOpen, setMobileOpen, setExpanded } = useSidebar();

  React.useEffect(() => {
    if (mobileOpen) setExpanded(true);
  }, [mobileOpen, setExpanded]);

  if (!mobileOpen) return null;

  return (
    <>
      <div
        role="presentation"
        className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        aria-hidden
        onClick={() => setMobileOpen(false)}
      />
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border/60 bg-card shadow-xl",
          "animate-in slide-in-from-left-4 duration-200",
          "lg:hidden",
        )}
        role="dialog"
        aria-label={t("nav.menu")}
      >
        <div className="flex justify-end border-b border-border/60 p-2 lg:hidden">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setMobileOpen(false)}
            aria-label={t("nav.closeMenu")}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <SidebarInDrawerContext.Provider value={true}>
          <SidebarContent />
        </SidebarInDrawerContext.Provider>
      </div>
    </>
  );
}

/** Drawer para tablet/mobile: overlay + painel com conteúdo da sidebar. Fechar ao clicar fora ou ao navegar. */
export function SidebarDrawer() {
  return <SidebarDrawerInner />;
}
