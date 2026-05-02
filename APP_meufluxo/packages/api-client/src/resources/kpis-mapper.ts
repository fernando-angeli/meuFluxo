import {
  DASHBOARD_PROJECTION_PLANNED_STATUSES,
  type CashMovementApiItem,
  type DashboardCategoryKpi,
  type DashboardKpisParams,
  type DashboardKpisResponse,
  type DashboardSubCategoryKpi,
  type DashboardTemporalSeries,
  type ExpenseRecord,
  type PageResponse,
} from "@meufluxo/types";

import type { HttpClient } from "../http";
import type { HttpQueryValue } from "../query-params";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function coerceNumber(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

/** LocalDate ISO ou array [ano, mês, dia] (Jackson legado). */
export function coerceIsoDate(v: unknown): string {
  if (typeof v === "string") {
    const s = v.slice(0, 10);
    return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : "";
  }
  if (Array.isArray(v) && v.length >= 3) {
    const y = Number(v[0]);
    const m = Number(v[1]);
    const d = Number(v[2]);
    if (![y, m, d].every((n) => Number.isFinite(n))) return "";
    return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }
  return "";
}

function toNullableNumberArray(v: unknown): number[] | null {
  if (!Array.isArray(v) || v.length === 0) return null;
  const nums = v.map((x) => coerceNumber(x)).filter((n) => Number.isInteger(n) && n > 0);
  return nums.length ? nums : null;
}

function mapSubCategory(raw: unknown): DashboardSubCategoryKpi {
  if (!isRecord(raw)) {
    return { subCategoryId: 0, subCategoryName: "—", total: 0, percent: 0 };
  }
  return {
    subCategoryId: Math.trunc(coerceNumber(raw.subCategoryId)),
    subCategoryName: String(raw.subCategoryName ?? "—"),
    total: coerceNumber(raw.total),
    percent: Math.trunc(coerceNumber(raw.percent)),
  };
}

function mapCategory(raw: unknown): DashboardCategoryKpi | null {
  if (!isRecord(raw)) return null;
  const subArr = Array.isArray(raw.subCategories) ? raw.subCategories.map(mapSubCategory) : [];
  return {
    categoryId: Math.trunc(coerceNumber(raw.categoryId)),
    categoryName: String(raw.categoryName ?? "—"),
    total: coerceNumber(raw.total),
    percent: Math.trunc(coerceNumber(raw.percent)),
    subCategories: subArr,
  };
}

function mapCategoryList(v: unknown): DashboardCategoryKpi[] {
  if (!Array.isArray(v)) return [];
  return v.map(mapCategory).filter((c): c is DashboardCategoryKpi => c !== null);
}

/**
 * Converte o JSON do backend (record Java) para o contrato usado pelo app.
 * Aceita `incomesByCategory` (API) ou `incomeByCategory` (legado/mock).
 */
export function mapDashboardKpiApiPayload(raw: unknown): Omit<
  DashboardKpisResponse,
  "temporalEvolution" | "movements"
> {
  if (!isRecord(raw)) {
    throw new Error("Resposta do dashboard inválida.");
  }

  const incomeByCategory = mapCategoryList(
    raw.incomesByCategory ?? raw.incomeByCategory,
  );
  const expensesByCategory = mapCategoryList(raw.expensesByCategory);

  return {
    startDate: coerceIsoDate(raw.startDate) || String(raw.startDate ?? ""),
    endDate: coerceIsoDate(raw.endDate) || String(raw.endDate ?? ""),
    accountIds: toNullableNumberArray(raw.accountIds),
    categoryIds: toNullableNumberArray(raw.categoryIds),
    currentBalance: coerceNumber(raw.currentBalance),
    totalIncome: coerceNumber(raw.totalIncome),
    totalExpense: coerceNumber(raw.totalExpense),
    netBalance: coerceNumber(raw.netBalance),
    expensesByCategory,
    incomeByCategory,
  };
}

function occurredAtToIsoDate(item: CashMovementApiItem): string {
  const v = item.occurredAt as unknown;
  const s = coerceIsoDate(v);
  return s || (typeof v === "string" ? v : "");
}

export function buildTemporalEvolutionFromMovements(
  items: CashMovementApiItem[],
  startDate: string,
  endDate: string,
): DashboardTemporalSeries {
  const labels = ["Sem 1", "Sem 2", "Sem 3", "Sem 4"];
  const income = [0, 0, 0, 0];
  const expenses = [0, 0, 0, 0];
  const start = new Date(`${startDate}T12:00:00`);
  const end = new Date(`${endDate}T12:00:00`);
  const span = end.getTime() - start.getTime();
  if (!Number.isFinite(span) || span <= 0) {
    return { labels: [], income: [], expenses: [] };
  }
  const bucket = span / 4;
  for (const m of items) {
    const iso = occurredAtToIsoDate(m);
    if (!iso) continue;
    const t = new Date(`${iso}T12:00:00`).getTime();
    const idx = Math.min(3, Math.max(0, Math.floor((t - start.getTime()) / bucket)));
    if (m.movementType === "INCOME") income[idx] += Math.abs(m.amount);
    else if (m.movementType === "EXPENSE") expenses[idx] += Math.abs(m.amount);
  }
  return { labels, income, expenses };
}

const MOVEMENTS_PAGE_SIZE = 500;
const MOVEMENTS_MAX_PAGES = 15;

function buildCashMovementQuery(
  params: DashboardKpisParams,
): Record<string, HttpQueryValue> {
  const query: Record<string, HttpQueryValue> = {
    startDate: params.startDate,
    endDate: params.endDate,
    sort: "occurredAt,desc",
    size: MOVEMENTS_PAGE_SIZE,
  };
  if (params.movementType) {
    query.movementType = params.movementType;
  }
  if (params.accountIds?.length === 1) {
    query.accountId = params.accountIds[0];
  }
  if (params.categoryIds?.length === 1) {
    query.categoryId = params.categoryIds[0];
  }
  if (params.subCategoryIds?.length === 1) {
    query.subCategoryId = params.subCategoryIds[0];
  }
  return query;
}

function filterMovementsClientSide(
  items: CashMovementApiItem[],
  params: DashboardKpisParams,
): CashMovementApiItem[] {
  let out = items;
  const accounts = params.accountIds;
  if (accounts && accounts.length > 1) {
    const set = new Set(accounts);
    out = out.filter((m) => set.has(m.account.id));
  }
  const cats = params.categoryIds;
  if (cats && cats.length > 1) {
    const set = new Set(cats);
    out = out.filter((m) => {
      const id = m.subCategory?.category?.id;
      return id != null && set.has(id);
    });
  }
  const subs = params.subCategoryIds;
  if (subs && subs.length > 1) {
    const set = new Set(subs);
    out = out.filter((m) => {
      const id = m.subCategory?.id;
      return id != null && set.has(id);
    });
  }
  return out;
}

/** Busca páginas de movimentações alinhadas aos filtros do dashboard (melhor esforço vs. API só aceita um id por tipo). */
export async function fetchCashMovementsForDashboard(
  http: HttpClient,
  params: DashboardKpisParams,
): Promise<CashMovementApiItem[]> {
  const base = buildCashMovementQuery(params);
  const all: CashMovementApiItem[] = [];
  for (let page = 0; page < MOVEMENTS_MAX_PAGES; page += 1) {
    const res = await http.request<PageResponse<CashMovementApiItem>>("/cash-movement", {
      method: "GET",
      query: { ...base, page },
    });
    const chunk = res.content ?? [];
    all.push(...chunk);
    if (res.last || chunk.length < MOVEMENTS_PAGE_SIZE) break;
  }
  return filterMovementsClientSide(all, params);
}

const PLANNED_PAGE_SIZE = 200;
const PLANNED_MAX_PAGES = 25;

/** Desloca uma data ISO (calendário local) por N dias; string vazia se entrada inválida. */
function calendarAddDaysIso(isoDate: string, deltaDays: number): string {
  const [y, mo, d] = isoDate.split("-").map((x) => Number(x));
  if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(d)) return "";
  const dt = new Date(y, mo - 1, d);
  dt.setDate(dt.getDate() + deltaDays);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

type PlannedDueWindow = { dueDateStart?: string; dueDateEnd?: string };

function buildPlannedListQuery(
  params: DashboardKpisParams,
  page: number,
  window: PlannedDueWindow,
): Record<string, HttpQueryValue> {
  const query: Record<string, HttpQueryValue> = {
    page,
    size: PLANNED_PAGE_SIZE,
    sort: "dueDate,ASC",
    status: [...DASHBOARD_PROJECTION_PLANNED_STATUSES],
  };
  if (window.dueDateStart) query.dueDateStart = window.dueDateStart;
  if (window.dueDateEnd) query.dueDateEnd = window.dueDateEnd;
  if (params.accountIds?.length) {
    query.accountIds = params.accountIds;
  }
  if (params.categoryIds?.length) {
    query.categoryIds = params.categoryIds;
  }
  if (params.subCategoryIds?.length) {
    query.subCategoryIds = params.subCategoryIds;
  }
  return query;
}

function dedupeExpenseRecordsById(rows: ExpenseRecord[]): ExpenseRecord[] {
  const map = new Map<string, ExpenseRecord>();
  for (const r of rows) {
    map.set(String(r.id), r);
  }
  return [...map.values()];
}

async function fetchPlannedWindowPages(
  http: HttpClient,
  basePath: "/expenses" | "/income",
  params: DashboardKpisParams,
  window: PlannedDueWindow,
): Promise<ExpenseRecord[]> {
  const all: ExpenseRecord[] = [];
  for (let page = 0; page < PLANNED_MAX_PAGES; page += 1) {
    const res = await http.request<PageResponse<ExpenseRecord>>(basePath, {
      method: "GET",
      query: buildPlannedListQuery(params, page, window),
    });
    const chunk = res.content ?? [];
    all.push(...chunk);
    if (res.last || chunk.length < PLANNED_PAGE_SIZE) break;
  }
  return all;
}

/** Planejados OPEN (API: status OPEN+OVERDUE) no intervalo de vencimento + atrasados anteriores ao início do período. */
export async function fetchAllOpenPlannedForDashboard(
  http: HttpClient,
  basePath: "/expenses" | "/income",
  params: DashboardKpisParams,
): Promise<ExpenseRecord[]> {
  const inRange = await fetchPlannedWindowPages(http, basePath, params, {
    dueDateStart: params.startDate,
    dueDateEnd: params.endDate,
  });
  const backlogEnd = calendarAddDaysIso(params.startDate, -1);
  let backlog: ExpenseRecord[] = [];
  if (backlogEnd) {
    backlog = await fetchPlannedWindowPages(http, basePath, params, { dueDateEnd: backlogEnd });
  }
  return dedupeExpenseRecordsById([...inRange, ...backlog]);
}

/** Soma lançamentos planejados em aberto (vencimento no período) às séries temporais já calculadas com caixa. */
export function mergePlannedIntoTemporalSeries(
  base: DashboardTemporalSeries,
  plannedExpenses: ExpenseRecord[],
  plannedIncomes: ExpenseRecord[],
  startDate: string,
  endDate: string,
): DashboardTemporalSeries {
  const useBase =
    base.labels.length === 4 &&
    base.income.length === 4 &&
    base.expenses.length === 4;
  const labels = useBase ? [...base.labels] : ["Sem 1", "Sem 2", "Sem 3", "Sem 4"];
  const income = useBase ? [...base.income] : [0, 0, 0, 0];
  const expenses = useBase ? [...base.expenses] : [0, 0, 0, 0];

  const start = new Date(`${startDate}T12:00:00`);
  const end = new Date(`${endDate}T12:00:00`);
  const span = end.getTime() - start.getTime();
  if (!Number.isFinite(span) || span <= 0) {
    return { labels: [...labels], income: [...income], expenses: [...expenses] };
  }
  const bucket = span / 4;

  const add = (isoDate: string, amount: number, isIncome: boolean) => {
    if (!isoDate) return;
    const t = new Date(`${isoDate}T12:00:00`).getTime();
    const idx = Math.min(3, Math.max(0, Math.floor((t - start.getTime()) / bucket)));
    if (isIncome) income[idx] += Math.abs(amount);
    else expenses[idx] += Math.abs(amount);
  };

  for (const r of plannedExpenses) {
    const iso = coerceIsoDate(r.dueDate as unknown);
    add(iso, coerceNumber(r.expectedAmount as unknown), false);
  }
  for (const r of plannedIncomes) {
    const iso = coerceIsoDate(r.dueDate as unknown);
    add(iso, coerceNumber(r.expectedAmount as unknown), true);
  }

  return {
    labels: [...labels],
    income,
    expenses,
  };
}
