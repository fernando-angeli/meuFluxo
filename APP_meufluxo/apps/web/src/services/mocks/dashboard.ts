import type {
  DashboardKpisResponse,
  DashboardCategoryKpi,
  DashboardMovementRow,
  DashboardMovementStatus,
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

export const mockChartData = [
  { name: "Sem 1", income: 5200, expenses: 1800 },
  { name: "Sem 2", income: 0, expenses: 900 },
  { name: "Sem 3", income: 0, expenses: 1100 },
  { name: "Sem 4", income: 0, expenses: 700 },
];

const incomeByCategoryMock: DashboardCategoryKpi[] = [
  {
    categoryId: 1,
    categoryName: "Salário",
    total: 5200,
    percent: 100,
    subCategories: [
      { subCategoryId: 1, subCategoryName: "Salário principal", total: 5200, percent: 100 },
    ],
  },
];

const expensesByCategoryMock: DashboardCategoryKpi[] = [
  {
    categoryId: 2,
    categoryName: "Casa",
    total: 2260.8,
    percent: 89,
    subCategories: [
      { subCategoryId: 16, subCategoryName: "Manutenção", total: 1260.7, percent: 56 },
      { subCategoryId: 14, subCategoryName: "IPTU", total: 1000.1, percent: 44 },
    ],
  },
  {
    categoryId: 3,
    categoryName: "Carro",
    total: 291.55,
    percent: 11,
    subCategories: [
      { subCategoryId: 18, subCategoryName: "Combustível", total: 151.05, percent: 52 },
      { subCategoryId: 17, subCategoryName: "Manutenção", total: 140.5, percent: 48 },
    ],
  },
];

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

function buildMovementsMock(): DashboardMovementRow[] {
  return mockCashMovements.map((m, index) => ({
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

/** Mock do GET /kpis/dashboard — mesmo formato da API para trocar depois. */
export function getMockDashboardKpis(
  startDate = "2026-03-01",
  endDate = "2026-03-31",
): DashboardKpisResponse {
  const totalExpense = 2552.35;
  const totalIncome = 5200;
  const movements = buildMovementsMock();
  return {
    startDate,
    endDate,
    accountIds: [2],
    categoryIds: null,
    currentBalance: -2452.35,
    totalIncome,
    totalExpense,
    netBalance: totalIncome - totalExpense,
    expensesByCategory: expensesByCategoryMock,
    incomeByCategory: incomeByCategoryMock,
    temporalEvolution: {
      labels: ["Sem 1", "Sem 2", "Sem 3", "Sem 4"],
      income: [5200, 0, 0, 0],
      expenses: [325.8, 1000.1, 826.45, 400],
    },
    movements,
  };
}

