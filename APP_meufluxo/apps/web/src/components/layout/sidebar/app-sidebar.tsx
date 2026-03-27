"use client";

import * as React from "react";

import { SIDEBAR_COLLAPSED_CLASS, SIDEBAR_EXPANDED_CLASS } from "./sidebar-header";
import { SidebarContent } from "./sidebar-content";
import { useSidebar } from "./sidebar-context";
import { cn } from "@/lib/utils";

type AppSidebarProps = { className?: string };

export function AppSidebar({ className }: AppSidebarProps) {
  const { expanded, setExpanded } = useSidebar();

  const handleMouseEnter = React.useCallback(() => {
    setExpanded(true);
  }, [setExpanded]);

  const handleMouseLeave = React.useCallback(() => {
    setExpanded(false);
  }, [setExpanded]);

  return (
    <aside
      className={cn(
        "flex h-dvh flex-col border-r border-border/60 bg-card/70 shadow-sm transition-[width] duration-200 ease-in-out",
        expanded ? SIDEBAR_EXPANDED_CLASS : SIDEBAR_COLLAPSED_CLASS,
        className,
      )}
      data-state={expanded ? "expanded" : "collapsed"}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <SidebarContent />
    </aside>
  );
}
