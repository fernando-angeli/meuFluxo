import type {
  AuthApi,
  UsersApi,
  WorkspaceApi,
  AccountsApi,
  CategoriesApi,
  SubCategoriesApi,
  CashMovementsApi,
  ScheduledMovementsApi,
  CreditCardsApi,
  InvoicesApi,
  NotificationsApi,
  KpisApi,
  ExpensesApi,
  HolidaysApi,
} from "./resources";

import { HttpClient } from "./http";
import {
  createAuthApi,
  createUsersApi,
  createWorkspaceApi,
  createAccountsApi,
  createCategoriesApi,
  createSubCategoriesApi,
  createCashMovementsApi,
  createScheduledMovementsApi,
  createCreditCardsApi,
  createInvoicesApi,
  createNotificationsApi,
  createKpisApi,
  createExpensesApi,
  createHolidaysApi,
} from "./resources";

export type MeuFluxoApi = {
  auth: AuthApi;
  users: UsersApi;
  workspace: WorkspaceApi;
  accounts: AccountsApi;
  categories: CategoriesApi;
  subCategories: SubCategoriesApi;
  cashMovements: CashMovementsApi;
  scheduledMovements: ScheduledMovementsApi;
  creditCards: CreditCardsApi;
  invoices: InvoicesApi;
  notifications: NotificationsApi;
  kpis: KpisApi;
  expenses: ExpensesApi;
  holidays: HolidaysApi;
};

export function createMeuFluxoApi(http: HttpClient): MeuFluxoApi {
  return {
    auth: createAuthApi(http),
    users: createUsersApi(http),
    workspace: createWorkspaceApi(http),
    accounts: createAccountsApi(http),
    categories: createCategoriesApi(http),
    subCategories: createSubCategoriesApi(http),
    cashMovements: createCashMovementsApi(http),
    scheduledMovements: createScheduledMovementsApi(http),
    creditCards: createCreditCardsApi(http),
    invoices: createInvoicesApi(http),
    notifications: createNotificationsApi(http),
    kpis: createKpisApi(http),
    expenses: createExpensesApi(http),
    holidays: createHolidaysApi(http),
  };
}
