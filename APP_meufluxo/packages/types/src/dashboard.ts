export type DashboardSubCategoryKpi = {
  subCategoryId: number;
  subCategoryName: string;
  total: number;
  percent: number;
};

export type DashboardCategoryKpi = {
  categoryId: number;
  categoryName: string;
  total: number;
  percent: number;
  subCategories: DashboardSubCategoryKpi[];
};

/** Série temporal para gráfico de evolução (entradas x saídas por período). */
export type DashboardTemporalSeries = {
  labels: string[];
  income: number[];
  expenses: number[];
};

/** Status exibido na listagem de movimentações do dashboard. */
export type DashboardMovementStatus = "paga" | "aberta" | "projeção";

/** Linha da tabela de movimentações do dashboard (view model com nomes resolvidos). */
export type DashboardMovementRow = {
  id: string;
  description: string;
  categoryName: string;
  subcategoryName: string;
  date: string;
  value: number;
  accountName: string;
  paymentMethod: string;
  status: DashboardMovementStatus;
};

export type DashboardKpisResponse = {
  startDate: string;
  endDate: string;
  accountIds: number[] | null;
  categoryIds: number[] | null;
  currentBalance: number;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  expensesByCategory: DashboardCategoryKpi[];
  incomeByCategory: DashboardCategoryKpi[];
  temporalEvolution: DashboardTemporalSeries;
  movements: DashboardMovementRow[];
};

export type DashboardKpisParams = {
  startDate: string;
  endDate: string;
  accountIds?: number[];
  categoryIds?: number[];
  subCategoryIds?: number[];
  /** Omitido ou todos os tipos: a API considera receitas e despesas. */
  movementType?: "INCOME" | "EXPENSE";
  /** Inclui planejados em aberto ou em atraso (vencimento no período ou antes do início) nos KPIs e séries. */
  includeProjections?: boolean;
};
