"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const items = [
  { href: "/credit-cards", label: "Cartões" },
  { href: "/invoices", label: "Faturas" },
  { href: "/cards/closing", label: "Fechamento" },
  { href: "/card-expenses", label: "Lançamentos" },
] as const;

export function CardsModuleNav() {
  const pathname = usePathname();

  return (
    <div className="inline-flex flex-wrap items-center gap-1 rounded-xl border bg-card p-1">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
