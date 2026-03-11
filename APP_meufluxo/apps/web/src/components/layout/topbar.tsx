"use client";

import Link from "next/link";
import { Bell } from "lucide-react";

import { SidebarTrigger } from "@/components/layout/sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";

export function Topbar() {
  const { t } = useTranslation();
  return (
    <header className="flex h-14 items-center justify-between gap-3 bg-background/60 px-3 lg:px-4 backdrop-blur supports-[backdrop-filter]:bg-background/40">
      <div className="flex flex-1 items-center gap-3 min-w-0">
        <SidebarTrigger className="shrink-0" />
        <div className="flex items-center gap-2 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-slim.svg"
            alt="MeuFluxo"
            width={28}
            height={28}
            className="h-7 w-7 object-contain"
          />
          <div className="hidden leading-tight sm:block">
            <div className="text-[16px] text-muted-foreground">{t("app.tagline")}</div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label={t("topbar.notifications")} asChild>
          <Link href="/notifications">
            <Bell className="h-4 w-4" />
          </Link>
        </Button>
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}

