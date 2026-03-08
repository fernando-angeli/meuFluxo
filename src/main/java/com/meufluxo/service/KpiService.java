package com.meufluxo.service;

import com.meufluxo.dto.kpi.CategoryKpiResponse;
import com.meufluxo.dto.kpi.CategoryGroupedKpiResponse;
import com.meufluxo.dto.kpi.DashboardKpiRequest;
import com.meufluxo.dto.kpi.DashboardKpiResponse;
import com.meufluxo.dto.kpi.SubCategoryGroupedKpiResponse;
import com.meufluxo.dto.kpi.SubCategoryKpiResponse;
import com.meufluxo.repository.AccountRepository;
import com.meufluxo.repository.CashMovementKpiRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class KpiService extends BaseUserService{

    private final AccountRepository accountRepository;
    private final CashMovementKpiRepository cashMovementKpiRepository;

    public KpiService(
            CurrentUserService currentUserService,
            AccountRepository accountRepository,
            CashMovementKpiRepository  cashMovementKpiRepository
    ) {
        super(currentUserService);
        this.accountRepository = accountRepository;
        this.cashMovementKpiRepository = cashMovementKpiRepository;
    }

    public DashboardKpiResponse getDashboardKpis(DashboardKpiRequest request) {
        validatePeriod(request);

        List<Long> accountIds = resolveAccountIds(request.accountIds());
        List<Long> categoryIds = resolveCategoryIds(request.categoryIds());

        BigDecimal currentBalance = defaultIfNull(
                accountRepository.sumBalanceByAccountIdsAndUserId(accountIds, getCurrentUserId())
        );

        BigDecimal totalIncome = defaultIfNull(
                cashMovementKpiRepository.sumIncome(
                        request.startDate(),
                        request.endDate(),
                        accountIds,
                        categoryIds
                )
        );

        BigDecimal totalExpense = defaultIfNull(
                cashMovementKpiRepository.sumExpense(
                        request.startDate(),
                        request.endDate(),
                        accountIds,
                        categoryIds
                )
        );

        BigDecimal netBalance = totalIncome.subtract(totalExpense);

        List<CategoryKpiResponse> flatExpensesByCategory =
                cashMovementKpiRepository.findExpensesByCategory(
                        request.startDate(),
                        request.endDate(),
                        accountIds,
                        categoryIds
                )
                .stream()
                .map(category -> new CategoryKpiResponse(
                        category.categoryId(),
                        category.categoryName(),
                        category.total(),
                        calculatePercent(category.total(), totalExpense)
                ))
                .toList();

        List<SubCategoryKpiResponse> flatExpensesBySubCategory =
            cashMovementKpiRepository.findExpensesBySubCategory(
                            request.startDate(),
                            request.endDate(),
                            accountIds,
                            categoryIds
                    )
                    .stream()
                    .map(subCategory -> new SubCategoryKpiResponse(
                            subCategory.categoryId(),
                            subCategory.categoryName(),
                            subCategory.subCategoryId(),
                            subCategory.subCategoryName(),
                            subCategory.total(),
                            0
                    ))
                    .toList();

        List<CategoryGroupedKpiResponse> expensesByCategory = buildCategoryGroupedKpis(
                flatExpensesByCategory,
                flatExpensesBySubCategory
        );

        return new DashboardKpiResponse(
                request.startDate(),
                request.endDate(),
                accountIds,
                categoryIds,
                currentBalance,
                totalIncome,
                totalExpense,
                netBalance,
                expensesByCategory
        );
    }

    private void validatePeriod(DashboardKpiRequest request) {
        if (request.startDate() == null || request.endDate() == null) {
            throw new IllegalArgumentException("Start date and end date must be informed.");
        }

        if (request.startDate().isAfter(request.endDate())) {
            throw new IllegalArgumentException("Start date must be before or equal to end date.");
        }
    }

    private List<Long> resolveAccountIds(List<Long> accountIds) {
        if (accountIds != null && !accountIds.isEmpty()) {
            return accountIds;
        }
        return accountRepository.findAllAccountIds(getCurrentUserId());
    }

    private List<Long> resolveCategoryIds(List<Long> categoryIds) {
        if (categoryIds != null && !categoryIds.isEmpty()) {
            return categoryIds;
        }

        return null;
    }

    private BigDecimal defaultIfNull(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }

    private List<CategoryGroupedKpiResponse> buildCategoryGroupedKpis(
            List<CategoryKpiResponse> categoryTotals,
            List<SubCategoryKpiResponse> subCategoryTotals
    ) {
        Map<Long, List<SubCategoryKpiResponse>> subCategoriesByCategory = new LinkedHashMap<>();
        for (SubCategoryKpiResponse subCategoryTotal : subCategoryTotals) {
            subCategoriesByCategory
                    .computeIfAbsent(subCategoryTotal.categoryId(), ignored -> new ArrayList<>())
                    .add(subCategoryTotal);
        }

        List<CategoryGroupedKpiResponse> grouped = new ArrayList<>();
        for (CategoryKpiResponse categoryTotal : categoryTotals) {
            List<SubCategoryGroupedKpiResponse> subCategories = subCategoriesByCategory
                    .getOrDefault(categoryTotal.categoryId(), List.of())
                    .stream()
                    .map(subCategory -> new SubCategoryGroupedKpiResponse(
                            subCategory.subCategoryId(),
                            subCategory.subCategoryName(),
                            subCategory.total(),
                            calculatePercent(subCategory.total(), categoryTotal.total())
                    ))
                    .toList();

            grouped.add(new CategoryGroupedKpiResponse(
                    categoryTotal.categoryId(),
                    categoryTotal.categoryName(),
                    categoryTotal.total(),
                    categoryTotal.percent(),
                    subCategories
            ));
        }

        return grouped;
    }

    private Integer calculatePercent(BigDecimal categoryTotal, BigDecimal totalExpense) {
        if (categoryTotal == null || categoryTotal.compareTo(BigDecimal.ZERO) <= 0) {
            return 0;
        }
        if (totalExpense == null || totalExpense.compareTo(BigDecimal.ZERO) <= 0) {
            return 0;
        }
        return categoryTotal
                .multiply(BigDecimal.valueOf(100))
                .divide(totalExpense, 0, RoundingMode.HALF_UP)
                .intValue();
    }

}
