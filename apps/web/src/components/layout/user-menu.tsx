"use client";

import { ChevronDown } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase().slice(0, 2);
  }
  return name.slice(0, 2).toUpperCase() || "?";
}

export function UserMenu() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const name = user?.fullName ?? "";
  const email = user?.email ?? "";
  const initials = name ? getInitials(name) : "?";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 rounded-full px-2 pl-1 pr-2 text-sm hover:bg-accent/60"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {initials}
          </div>
          <div className="hidden flex-col text-left text-xs sm:flex">
            <span className="font-medium leading-tight">{name || t("userMenu.guest")}</span>
            <span className="text-[11px] text-muted-foreground">{email}</span>
          </div>
          <ChevronDown className="hidden h-3 w-3 text-muted-foreground sm:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>{t("userMenu.myAccount")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href="/settings">{t("userMenu.preferences")}</a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={() => void logout()}>
          {t("userMenu.logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
