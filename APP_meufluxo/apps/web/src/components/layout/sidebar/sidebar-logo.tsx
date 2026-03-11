"use client";

import * as React from "react";
import { useTheme } from "next-themes";

import { useSidebar } from "./sidebar-context";
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
      className={cn("h-8 w-8 shrink-0 object-contain", className)}
      aria-hidden
    />
  );
}

/** Logo completo (ícone + texto) — usado no menu expandido. Troca entre light/dark conforme o tema. */
function LogoFull({ className }: { className?: string }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const src = isDark ? "/logo-full-dark.svg" : "/logo-full-ligth.svg";

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="MeuFluxo"
      width={140}
      height={32}
      className={cn("h-8 w-auto shrink-0 object-contain object-left", className)}
      aria-hidden
    />
  );
}

export function SidebarLogo() {
  const { expanded } = useSidebar();

  return (
    <div
      className={cn(
        "flex min-h-[3rem] items-center overflow-hidden transition-[width] duration-200 ease-in-out",
        expanded ? "w-full" : "w-10 justify-center",
      )}
    >
      {expanded ? (
        <LogoFull className="shrink-0" />
      ) : (
        <LogoIcon />
      )}
    </div>
  );
}
