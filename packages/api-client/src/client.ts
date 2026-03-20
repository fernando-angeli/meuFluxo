import type {
  AuthApi,
  UsersApi,
  WorkspaceApi,
  AccountsApi,
  CategoriesApi,
  CashMovementsApi,
  ScheduledMovementsApi,
  CreditCardsApi,
  InvoicesApi,
  NotificationsApi,
  KpisApi,
} from "./resources";

import { HttpClient } from "./http";
import {
  createAuthApi,
  createUsersApi,
  createWorkspaceApi,
  createAccountsApi,
  createCategoriesApi,
  createCashMovementsApi,
  createScheduledMovementsApi,
  createCreditCardsApi,
  createInvoicesApi,
  createNotificationsApi,
  createKpisApi,
} from "./resources";

export type MeuFluxoApi = {
  auth: AuthApi;
  users: UsersApi;
  workspace: WorkspaceApi;
  accounts: AccountsApi;
  categories: CategoriesApi;
  cashMovements: CashMovementsApi;
  scheduledMovements: ScheduledMovementsApi;
  creditCards: CreditCardsApi;
  invoices: InvoicesApi;
  notifications: NotificationsApi;
  kpis: KpisApi;
};

export function createMeuFluxoApi(http: HttpClient): MeuFluxoApi {
  return {
    auth: createAuthApi(http),
    users: createUsersApi(http),
    workspace: createWorkspaceApi(http),
    accounts: createAccountsApi(http),
    categories: createCategoriesApi(http),
    cashMovements: createCashMovementsApi(http),
    scheduledMovements: createScheduledMovementsApi(http),
    creditCards: createCreditCardsApi(http),
    invoices: createInvoicesApi(http),
    notifications: createNotificationsApi(http),
    kpis: createKpisApi(http),
  };
}
