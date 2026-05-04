import type { Account } from "./accounts";
import type { Category, SubCategory } from "./categories";
import type { CreditCard } from "./credit-cards";

export type UserLanguage = "pt-BR" | "en" | "es";
export type UserTheme = "light" | "dark" | "system";

/** Valores enviados ao PATCH de preferência de tema (API). */
export type UserThemeApi = "LIGHT" | "DARK" | "SYSTEM";

/** Corpo da resposta 200 do PATCH `/users/{id}/preferences/theme`. */
export type UserPreferencesThemePatchResponse = {
  language: string;
  theme: string;
  currency: string;
  dateFormat: string;
  timezone: string;
};

/** Converte tema vindo da API (ex.: LIGHT) para o contrato do app / next-themes. */
export function normalizeUserTheme(raw: string | null | undefined): UserTheme {
  const u = String(raw ?? "LIGHT").toUpperCase();
  if (u === "DARK") return "dark";
  if (u === "SYSTEM") return "system";
  return "light";
}

/** Converte idioma vindo da API (ex.: PT_BR) para o contrato do app. */
export function normalizeUserLanguage(raw: string | null | undefined): UserLanguage {
  const u = String(raw ?? "PT_BR").toUpperCase().replace("-", "_");
  if (u === "EN" || u === "EN_US") return "en";
  if (u === "ES" || u === "ES_ES") return "es";
  return "pt-BR";
}

/** Monta `UserPreferences` a partir da resposta do PATCH de tema (ou payload equivalente). */
export function userPreferencesFromThemePatchResponse(
  response: UserPreferencesThemePatchResponse,
): UserPreferences {
  return {
    language: normalizeUserLanguage(response.language),
    theme: normalizeUserTheme(response.theme),
    currency: response.currency ?? "BRL",
    dateFormat: response.dateFormat ?? "dd/MM/yyyy",
    timezone: response.timezone ?? "America/Sao_Paulo",
  };
}

export function userThemeToApi(theme: UserTheme): UserThemeApi {
  if (theme === "dark") return "DARK";
  if (theme === "system") return "SYSTEM";
  return "LIGHT";
}

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
