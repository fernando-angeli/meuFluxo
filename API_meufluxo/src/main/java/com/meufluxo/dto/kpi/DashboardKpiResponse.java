package com.meufluxo.dto.kpi;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record DashboardKpiResponse(
        LocalDate startDate,
        LocalDate endDate,
        List<Long> accountIds,
        List<Long> categoryIds,
        List<Long> subCategoryIds,
        String paymentMethod,
        String movementType,
        BigDecimal currentBalance,
        BigDecimal totalIncome,
        BigDecimal totalExpense,
        BigDecimal netBalance,
        List<CategoryGroupedKpiResponse> expensesByCategory,
        List<CategoryGroupedKpiResponse> incomesByCategory
) {
}
