"use client";

import * as React from "react";

import { SIDEBAR_COLLAPSED_CLASS, SIDEBAR_EXPANDED_CLASS } from "./sidebar-header";
import { SidebarContent } from "./sidebar-content";
import { useSidebar } from "./sidebar-context";
import { cn } from "@/lib/utils";

const COLLAPSE_DELAY_MS = 5000;

type AppSidebarProps = { className?: string };

export function AppSidebar({ className }: AppSidebarProps) {
  const asideRef = React.useRef<HTMLElement>(null);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const { expanded, setExpanded } = useSidebar();

  const clearCollapseTimeout = React.useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const scheduleCollapse = React.useCallback(() => {
    clearCollapseTimeout();
    timeoutRef.current = setTimeout(() => {
      setExpanded(false);
      timeoutRef.current = null;
    }, COLLAPSE_DELAY_MS);
  }, [clearCollapseTimeout, setExpanded]);

  const handleMouseEnter = React.useCallback(() => {
    clearCollapseTimeout();
  }, [clearCollapseTimeout]);

  const handleMouseLeave = React.useCallback(() => {
    if (expanded) scheduleCollapse();
  }, [expanded, scheduleCollapse]);

  const handleClick = React.useCallback(() => {
    if (expanded) scheduleCollapse();
  }, [expanded, scheduleCollapse]);

  React.useEffect(() => {
    if (!expanded) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (asideRef.current && !asideRef.current.contains(target)) {
        setExpanded(false);
      }
    };
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, [expanded, setExpanded]);

  React.useEffect(() => {
    return () => clearCollapseTimeout();
  }, [clearCollapseTimeout]);

  return (
    <aside
      ref={asideRef}
      className={cn(
        "flex h-dvh flex-col border-r border-border/60 bg-card/70 shadow-sm transition-[width] duration-200 ease-in-out",
        expanded ? SIDEBAR_EXPANDED_CLASS : SIDEBAR_COLLAPSED_CLASS,
        className,
      )}
      data-state={expanded ? "expanded" : "collapsed"}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <SidebarContent />
    </aside>
  );
}
