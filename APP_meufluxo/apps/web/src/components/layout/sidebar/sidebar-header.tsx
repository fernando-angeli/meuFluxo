"use client";

import * as React from "react";

import { SidebarLogo } from "./sidebar-logo";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { cn } from "@/lib/utils";

export const SIDEBAR_COLLAPSED_CLASS = "w-16";
export const SIDEBAR_EXPANDED_CLASS = "w-64";

export function SidebarHeader() {
  return (
    <header
      className={cn(
        "flex flex-col gap-2 border-b border-border/60 px-2 py-3 transition-[width] duration-200 ease-in-out w-full",
      )}
    >
      <div className="flex items-center justify-between gap-1">
        <SidebarLogo />
      </div>
      <WorkspaceSwitcher />
    </header>
  );
}

