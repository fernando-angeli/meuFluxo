"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

const SIDEBAR_STORAGE_KEY = "meufluxo-sidebar-expanded";

type SidebarContextValue = {
  expanded: boolean;
  setExpanded: (value: boolean) => void;
  toggle: () => void;
  /** Mobile: drawer open state */
  mobileOpen: boolean;
  setMobileOpen: (value: boolean) => void;
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

function getStoredExpanded(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const v = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    return v === "true";
  } catch {
    return false;
  }
}

function setStoredExpanded(value: boolean) {
  try {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(value));
  } catch {
    // ignore
  }
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [expanded, setExpandedState] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    setExpandedState(getStoredExpanded());
  }, []);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const setExpanded = React.useCallback((value: boolean) => {
    setExpandedState(value);
    setStoredExpanded(value);
  }, []);

  const toggle = React.useCallback(() => {
    setExpandedState((prev) => {
      const next = !prev;
      setStoredExpanded(next);
      return next;
    });
  }, []);

  const value = React.useMemo<SidebarContextValue>(
    () => ({
      expanded,
      setExpanded,
      toggle,
      mobileOpen,
      setMobileOpen,
    }),
    [expanded, setExpanded, toggle, mobileOpen],
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) {
    throw new Error("useSidebar must be used within SidebarProvider");
  }
  return ctx;
}

/** True quando o conteúdo da sidebar está sendo renderizado dentro do drawer (mobile). */
export const SidebarInDrawerContext = React.createContext(false);

export function useSidebarInDrawer() {
  return React.useContext(SidebarInDrawerContext);
}
