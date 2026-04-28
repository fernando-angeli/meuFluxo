import type {
  DashboardKpisResponse,
  DashboardCategoryKpi,
  DashboardMovementRow,
  DashboardMovementStatus,
  DashboardKpisParams,
  DashboardTemporalSeries,
  CashMovement,
} from "@meufluxo/types";
import { sum } from "@meufluxo/utils";
import { mockCashMovements } from "./cash-movements";
import { mockScheduledMovements } from "./scheduled-movements";

export function getDashboardKpis() {
  const income = sum(mockCashMovements.filter((m) => m.type === "INCOME").map((m) => m.amount));
  const expenses = sum(mockCashMovements.filter((m) => m.type === "EXPENSE").map((m) => m.amount));
  const scheduledDue = mockScheduledMovements.filter((s) => s.status === "DUE").length;

  return {
    income,
    expenses,
    net: income - expenses,
    scheduledDue,
  };
}

function trailingNumericId(value: unknown): number | null {
  if (value === undefined || value === null) return null;
  const s = String(value);
  const m = s.match(/(\d+)$/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}

function matchesMockFilters(m: CashMovement, params: DashboardKpisParams): boolean {
  if (m.occurredAt < params.startDate || m.occurredAt > params.endDate) {
    return false;
  }
  if (params.accountIds?.length) {
    const id = trailingNumericId(m.accountId) ?? Number(m.accountId);
    if (!Number.isFinite(id) || !params.accountIds.includes(Number(id))) {
      return false;
    }
  }
  if (params.categoryIds?.length) {
    const id = trailingNumericId(m.categoryId) ?? Number(m.categoryId);
    if (!Number.isFinite(id) || !params.categoryIds.includes(Number(id))) {
      return false;
    }
  }
  // Mock não tem subcategoria por movimento; subCategoryIds só afeta a API real.
  return true;
}

function paymentMethodLabel(method: string): string {
  const map: Record<string, string> = {
    PIX: "PIX",
    DEBIT_CARD: "Cartão de débito",
    CREDIT_CARD: "Cartão de crédito",
    CASH: "Dinheiro",
    TRANSFER: "Transferência",
    OTHER: "Outro",
  };
  return map[method] ?? method;
}

function statusForMovement(index: number): DashboardMovementStatus {
  if (index % 3 === 0) return "paga";
  if (index % 3 === 1) return "aberta";
  return "projeção";
}

function stableCategoryId(key: string): number {
  let h = 0;
  for (let i = 0; i < key.length; i += 1) {
    h = (h * 31 + key.charCodeAt(i)) | 0;
  }
  const n = Math.abs(h);
  return n > 0 ? n : 1;
}

function buildCategoryKpis(
  movements: CashMovement[],
  targetType: "INCOME" | "EXPENSE",
  typeTotal: number,
): DashboardCategoryKpi[] {
  const rows = movements.filter((m) => m.type === targetType);
  if (!typeTotal || typeTotal <= 0 || rows.length === 0) return [];

  const byCat = new Map<string, number>();
  for (const m of rows) {
    const key = m.categoryId != null ? String(m.categoryId) : "—";
    byCat.set(key, (byCat.get(key) ?? 0) + m.amount);
  }

  const result: DashboardCategoryKpi[] = [];
  for (const [key, catTotal] of byCat) {
    const categoryId = stableCategoryId(key);
    const percent = Math.min(100, Math.round((catTotal / typeTotal) * 100));
    result.push({
      categoryId,
      categoryName: key.startsWith("cat_") ? `Categoria ${key.replace(/^cat_/, "")}` : key,
      total: catTotal,
      percent,
      subCategories: [
        {
          subCategoryId: categoryId,
          subCategoryName: "—",
          total: catTotal,
          percent: 100,
        },
      ],
    });
  }
  return result;
}

function buildTemporalEvolution(
  movements: CashMovement[],
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
  for (const m of movements) {
    const t = new Date(`${m.occurredAt}T12:00:00`).getTime();
    const idx = Math.min(3, Math.max(0, Math.floor((t - start.getTime()) / bucket)));
    if (m.type === "INCOME") income[idx] += m.amount;
    else if (m.type === "EXPENSE") expenses[idx] += m.amount;
  }
  return { labels, income, expenses };
}

function buildMovementsMock(movements: CashMovement[]): DashboardMovementRow[] {
  return movements.map((m, index) => ({
    id: m.id,
    description: m.description ?? "—",
    categoryName: "Categoria",
    subcategoryName: "Subcategoria",
    date: m.occurredAt,
    value: m.type === "EXPENSE" ? -m.amount : m.amount,
    accountName: "Conta corrente",
    paymentMethod: paymentMethodLabel(m.paymentMethod ?? "OTHER"),
    status: statusForMovement(index),
  }));
}

/** Mock do GET /kpis/dashboard — mesmo contrato da API; filtra mocks por período e filtros suportados. */
export function getMockDashboardKpis(params: DashboardKpisParams): DashboardKpisResponse {
  const { startDate, endDate } = params;
  const filtered = mockCashMovements.filter((m) => matchesMockFilters(m, params));

  let totalIncome = sum(filtered.filter((m) => m.type === "INCOME").map((m) => m.amount));
  let totalExpense = sum(filtered.filter((m) => m.type === "EXPENSE").map((m) => m.amount));
  if (params.includeProjections === true) {
    totalIncome += 800;
    totalExpense += 450;
  }
  const netBalance = totalIncome - totalExpense;

  return {
    startDate,
    endDate,
    accountIds: params.accountIds?.length ? params.accountIds : null,
    categoryIds: params.categoryIds?.length ? params.categoryIds : null,
    currentBalance: netBalance,
    totalIncome,
    totalExpense,
    netBalance,
    expensesByCategory: buildCategoryKpis(filtered, "EXPENSE", totalExpense),
    incomeByCategory: buildCategoryKpis(filtered, "INCOME", totalIncome),
    temporalEvolution: buildTemporalEvolution(filtered, startDate, endDate),
    movements: buildMovementsMock(filtered),
  };
}
