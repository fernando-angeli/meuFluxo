import type { ExpensesApi } from "./expenses";
import { createPlannedEntriesApi } from "./expenses";
import type { HttpClient } from "../http";

export type IncomeApi = ExpensesApi;

export function createIncomeApi(http: HttpClient): IncomeApi {
  return createPlannedEntriesApi(http, "/income");
}
