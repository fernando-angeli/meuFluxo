import type { LucideIcon } from "lucide-react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Gauge,
  Landmark,
  Layers,
  Wallet,
} from "lucide-react";
import type { TranslationKey } from "@/lib/i18n";

/** Rota da página inicial após login. Altere aqui quando quiser outra home. */
export const HOME_PATH = "/dashboard";

export type NavItem = {
  /** Chave do dicionário i18n (ex: nav.dashboard) */
  titleKey: TranslationKey;
  href: string;
  icon: LucideIcon;
  /** Estrutura pronta para submenus futuros. */
  children?: NavChildItem[];
};

export type NavChildItem = {
  titleKey: TranslationKey;
  href: string;
};

export const mainNav: NavItem[] = [
  { titleKey: "nav.dashboard", href: "/dashboard", icon: Gauge },
  { titleKey: "nav.movements", href: "/cash-movements", icon: Wallet },
  { titleKey: "nav.accounts", href: "/accounts", icon: Landmark },
  { titleKey: "nav.categories", href: "/categories", icon: Layers },
  {
    titleKey: "nav.income",
    href: "/income",
    icon: ArrowUpCircle,
    children: [
      { titleKey: "nav.income.registrations", href: "/income/registrations" },
      { titleKey: "nav.income.receipts", href: "/income/receipts" },
      { titleKey: "nav.income.history", href: "/income/history" },
    ],
  },
  {
    titleKey: "nav.expenses",
    href: "/expenses",
    icon: ArrowDownCircle,
    children: [
      { titleKey: "nav.expenses.registrations", href: "/expenses/registrations" },
      { titleKey: "nav.expenses.payments", href: "/expenses/payments" },
      { titleKey: "nav.expenses.history", href: "/expenses/history" },
    ],
  },
];

export type NavGroup = {
  /** Chave do dicionário i18n para o label do grupo */
  labelKey: TranslationKey;
  items: NavItem[];
};

/** Grupos do menu lateral na nova estrutura funcional. */
export const mainNavGroups: NavGroup[] = [
  { labelKey: "nav.overview", items: mainNav.slice(0, 1) },
  { labelKey: "nav.finance", items: mainNav.slice(1) },
];

