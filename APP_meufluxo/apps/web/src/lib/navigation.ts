import type { LucideIcon } from "lucide-react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  CreditCard,
  Gauge,
  Landmark,
} from "lucide-react";
import type { TranslationKey } from "@/lib/i18n";

/** Rota da página inicial após login. Altere aqui quando quiser outra home. */
export const HOME_PATH = "/dashboard";

export type NavItem = {
  /** Chave do dicionário i18n (ex: nav.dashboard) */
  titleKey: TranslationKey;
  href?: string;
  icon: LucideIcon;
  children?: Array<{
    titleKey: TranslationKey;
    href: string;
  }>;
};

export const mainNav: NavItem[] = [
  { titleKey: "nav.dashboard", href: "/dashboard", icon: Gauge },
  {
    titleKey: "nav.accounts",
    icon: Landmark,
    children: [
      { titleKey: "nav.accounts", href: "/accounts" },
      { titleKey: "nav.accounts.statement", href: "/accounts/statement" },
    ],
  },
  { titleKey: "nav.income", href: "/receivables", icon: ArrowUpCircle },
  { titleKey: "nav.expenses", href: "/payables", icon: ArrowDownCircle },
  {
    titleKey: "nav.creditCards",
    icon: CreditCard,
    children: [
      { titleKey: "nav.creditCards", href: "/cards" },
      { titleKey: "nav.invoices", href: "/cards/invoices" },
      { titleKey: "nav.cardExpenses", href: "/cards/expenses" },
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
  { labelKey: "nav.overview", items: [mainNav[0]] },
  { labelKey: "nav.finance", items: mainNav.slice(1) },
];

