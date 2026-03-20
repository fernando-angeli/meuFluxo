import type { Account } from "./accounts";
import type { Category, SubCategory } from "./categories";
import type { CreditCard } from "./credit-cards";

export type UserLanguage = "pt-BR" | "en" | "es";
export type UserTheme = "light" | "dark" | "system";

export type UserPreferences = {
  language: UserLanguage;
  theme: UserTheme;
  currency: string;
  dateFormat: string;
  timezone: string;
};

export type WorkspaceSummary = {
  id: string;
  name: string;
};

export type WorkspaceMembershipRole = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";

export type WorkspaceMembership = {
  id: string;
  name: string;
  role: WorkspaceMembershipRole;
};

export type SyncState = {
  workspaceId: string;
  categoriesVersion: number;
  subCategoriesVersion: number;
  accountsVersion: number;
  creditCardsVersion: number;
  updatedAt: string;
};

export type AuthenticatedUserSessionResponse = {
  id: string;
  name: string;
  email: string;
  preferences: UserPreferences;
  activeWorkspace: WorkspaceSummary | null;
  workspaces: WorkspaceMembership[];
  categories: Category[];
  subCategories: SubCategory[];
  accounts: Account[];
  creditCards: CreditCard[];
  syncState: SyncState | null;
};
