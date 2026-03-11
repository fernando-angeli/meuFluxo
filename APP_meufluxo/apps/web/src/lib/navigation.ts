import type { LucideIcon } from "lucide-react";
import {
  Bell,
  CalendarClock,
  CreditCard,
  Gauge,
  Landmark,
  Layers,
  ReceiptText,
  Settings,
  Wallet,
} from "lucide-react";
import type { TranslationKey } from "@/lib/i18n";

export type NavItem = {
  /** Chave do dicionário i18n (ex: nav.dashboard) */
  titleKey: TranslationKey;
  href: string;
  icon: LucideIcon;
};

export const mainNav: NavItem[] = [
  { titleKey: "nav.dashboard", href: "/dashboard", icon: Gauge },
  { titleKey: "nav.accounts", href: "/accounts", icon: Landmark },
  { titleKey: "nav.categories", href: "/categories", icon: Layers },
  { titleKey: "nav.cashMovements", href: "/cash-movements", icon: Wallet },
  { titleKey: "nav.scheduled", href: "/scheduled-movements", icon: CalendarClock },
  { titleKey: "nav.creditCards", href: "/credit-cards", icon: CreditCard },
  { titleKey: "nav.invoices", href: "/invoices", icon: ReceiptText },
  { titleKey: "nav.notifications", href: "/notifications", icon: Bell },
  { titleKey: "nav.settings", href: "/settings", icon: Settings },
];

export type NavGroup = {
  /** Chave do dicionário i18n para o label do grupo */
  labelKey: TranslationKey;
  items: NavItem[];
};

/** Grupos do menu lateral: Overview (1 item), Finance (6), System (2). Mesma ordem e itens que mainNav. */
export const mainNavGroups: NavGroup[] = [
  { labelKey: "nav.overview", items: mainNav.slice(0, 1) },
  { labelKey: "nav.finance", items: mainNav.slice(1, 7) },
  { labelKey: "nav.system", items: mainNav.slice(7) },
];

