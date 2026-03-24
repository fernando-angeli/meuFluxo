"use client";

import * as React from "react";

import { useSidebar } from "./sidebar-context";
import { SidebarIconSlot } from "./sidebar-icon-slot";
import { cn } from "@/lib/utils";

/** Logo slim (ícone) — usado no menu recolhido. */
function LogoIcon({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo-slim.svg"
      alt="MeuFluxo"
      width={32}
      height={32}
      className={cn("h-8 w-8 object-contain", className)}
      aria-hidden
    />
  );
}

export function SidebarLogo() {
  const { expanded } = useSidebar();

  return (
    <div
      className={cn(
        "flex min-h-[3rem] items-center overflow-hidden",
        "w-full justify-start px-2",
      )}
    >
      <SidebarIconSlot>
        <LogoIcon />
      </SidebarIconSlot>
      <span
        className={cn(
          "ml-2 whitespace-nowrap text-base font-semibold text-black dark:text-white transition-all duration-200 ease-in-out",
          expanded ? "max-w-[120px] translate-x-0 opacity-100" : "max-w-0 -translate-x-1 opacity-0",
        )}
        aria-hidden={!expanded}
      >
        MeuFluxo
      </span>
    </div>
  );
}
