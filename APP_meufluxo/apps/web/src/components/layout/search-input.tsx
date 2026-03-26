"use client";

import { Search } from "lucide-react";

import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type SearchInputProps = {
  placeholder?: string;
  className?: string;
};

export function SearchInput({ placeholder = "Search...", className }: SearchInputProps) {
  const { t } = useTranslation();
  const resolvedPlaceholder = placeholder === "Search..." ? t("layout.searchPlaceholder") : placeholder;
  return (
    <div className={cn("relative hidden w-full max-w-sm items-center md:flex", className)}>
      <Search className="pointer-events-none absolute left-2.5 h-4 w-4 text-muted-foreground" />
      <input
        type="search"
        placeholder={resolvedPlaceholder}
        className="h-9 w-full rounded-lg border bg-background pl-8 pr-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:border-input focus-visible:ring-2 focus-visible:ring-ring"
      />
    </div>
  );
}

