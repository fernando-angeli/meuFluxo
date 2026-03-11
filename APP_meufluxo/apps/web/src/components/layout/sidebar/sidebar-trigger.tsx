"use client";

import * as React from "react";
import { PanelLeft } from "lucide-react";

import { useSidebar } from "./sidebar-context";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type SidebarTriggerProps = {
  className?: string;
};

/** Botão que abre o drawer da sidebar em viewports menores (tablet/mobile). Deve ser exibido apenas em lg:hidden. */
export function SidebarTrigger({ className }: SidebarTriggerProps) {
  const { t } = useTranslation();
  const { setMobileOpen } = useSidebar();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn("lg:hidden", className)}
      onClick={() => setMobileOpen(true)}
      aria-label={t("nav.openMenu")}
    >
      <PanelLeft className="h-5 w-5" />
    </Button>
  );
}
