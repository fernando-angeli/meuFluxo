package com.meufluxo.service;

import com.meufluxo.dto.kpi.CategoryGroupedKpiResponse;
import com.meufluxo.dto.kpi.DashboardKpiRequest;
import com.meufluxo.dto.kpi.DashboardKpiResponse;
import com.meufluxo.dto.kpi.SubCategoryGroupedKpiResponse;
import com.meufluxo.enums.MovementType;
import com.meufluxo.model.CashMovement;
import com.meufluxo.repository.AccountRepository;
import com.meufluxo.repository.CashMovementRepository;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class KpiService extends BaseUserService{

    private final AccountRepository accountRepository;
    private final CashMovementRepository cashMovementRepository;
    private final AccountService accountService;
    private final CategoryService categoryService;
    private final SubCategoryService subCategoryService;

    public KpiService(
            CurrentUserService currentUserService,
            AccountRepository accountRepository,
            CashMovementRepository cashMovementRepository,
            AccountService accountService,
            CategoryService categoryService,
            SubCategoryService subCategoryService
    ) {
        super(currentUserService);
        this.accountRepository = accountRepository;
        this.cashMovementRepository = cashMovementRepository;
        this.accountService = accountService;
        this.categoryService = categoryService;
        this.subCategoryService = subCategoryService;
    }

    public DashboardKpiResponse getDashboardKpis(DashboardKpiRequest request) {
        validatePeriod(request);

        List<Long> accountFilterIds = normalizeIds(request.accountIds());
        List<Long> categoryFilterIds = normalizeIds(request.categoryIds());
        List<Long> subCategoryFilterIds = normalizeIds(request.subCategoryIds());

        accountFilterIds.forEach(accountService::existsId);
        categoryFilterIds.forEach(categoryService::existsId);
        subCategoryFilterIds.forEach(subCategoryService::existsId);

        List<Long> accountIds = resolveAccountIds(accountFilterIds);

        BigDecimal currentBalance = defaultIfNull(
                accountRepository.sumBalanceByAccountIdsAndWorkspaceId(accountIds, getCurrentWorkspaceId())
        );

        Specification<CashMovement> specification = buildSpecification(
                request,
                accountFilterIds,
                categoryFilterIds,
                subCategoryFilterIds
        );
        List<CashMovement> filteredMovements = cashMovementRepository.findAll(specification);

        BigDecimal totalIncome = sumByType(filteredMovements, MovementType.INCOME);
        BigDecimal totalExpense = sumByType(filteredMovements, MovementType.EXPENSE);

        BigDecimal netBalance = totalIncome.subtract(totalExpense);

        List<CategoryGroupedKpiResponse> expensesByCategory = buildCategoryGroupedKpis(
                filteredMovements,
                totalExpense,
                MovementType.EXPENSE
        );
        List<CategoryGroupedKpiResponse> incomesByCategory = buildCategoryGroupedKpis(
                filteredMovements,
                totalIncome,
                MovementType.INCOME
        );
        return new DashboardKpiResponse(
                request.startDate(),
                request.endDate(),
                accountFilterIds,
                categoryFilterIds,
                subCategoryFilterIds,
                request.paymentMethod() != null ? request.paymentMethod().name() : null,
                request.movementType() != null ? request.movementType().name() : null,
                currentBalance,
                totalIncome,
                totalExpense,
                netBalance,
                expensesByCategory,
                incomesByCategory
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
        if (!accountIds.isEmpty()) {
            return accountIds;
        }
        return accountRepository.findAllAccountIds(getCurrentWorkspaceId());
    }

    private BigDecimal defaultIfNull(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }

    private BigDecimal sumByType(List<CashMovement> movements, MovementType movementType) {
        return movements.stream()
                .filter(movement -> movement.getMovementType() == movementType)
                .map(CashMovement::getAmount)
                .filter(amount -> amount != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private List<CategoryGroupedKpiResponse> buildCategoryGroupedKpis(
            List<CashMovement> movements,
            BigDecimal totalByType,
            MovementType targetType
    ) {
        Map<Long, CategoryAccumulator> categoryMap = new LinkedHashMap<>();

        for (CashMovement movement : movements) {
            if (movement.getMovementType() != targetType) {
                continue;
            }
            if (movement.getSubCategory() == null || movement.getSubCategory().getCategory() == null) {
                continue;
            }

            Long categoryId = movement.getSubCategory().getCategory().getId();
            String categoryName = movement.getSubCategory().getCategory().getName();
            MovementType categoryMovementType = movement.getSubCategory().getCategory().getMovementType();
            Long subCategoryId = movement.getSubCategory().getId();
            String subCategoryName = movement.getSubCategory().getName();
            BigDecimal amount = defaultIfNull(movement.getAmount());

            CategoryAccumulator categoryAccumulator = categoryMap.computeIfAbsent(
                    categoryId,
                    ignored -> new CategoryAccumulator(categoryName, categoryMovementType)
            );
            categoryAccumulator.total = categoryAccumulator.total.add(amount);

            SubCategoryAccumulator subCategoryAccumulator = categoryAccumulator.subCategories.computeIfAbsent(
                    subCategoryId,
                    ignored -> new SubCategoryAccumulator(subCategoryName)
            );
            subCategoryAccumulator.total = subCategoryAccumulator.total.add(amount);
        }

        List<CategoryGroupedKpiResponse> result = new ArrayList<>();
        for (Map.Entry<Long, CategoryAccumulator> categoryEntry : categoryMap.entrySet()) {
            Long categoryId = categoryEntry.getKey();
            CategoryAccumulator categoryAccumulator = categoryEntry.getValue();

            List<SubCategoryGroupedKpiResponse> subCategories = new ArrayList<>();
            for (Map.Entry<Long, SubCategoryAccumulator> subCategoryEntry : categoryAccumulator.subCategories.entrySet()) {
                Long subCategoryId = subCategoryEntry.getKey();
                SubCategoryAccumulator subCategoryAccumulator = subCategoryEntry.getValue();

                subCategories.add(new SubCategoryGroupedKpiResponse(
                        subCategoryId,
                        subCategoryAccumulator.name,
                        subCategoryAccumulator.total,
                        calculatePercent(subCategoryAccumulator.total, categoryAccumulator.total)
                ));
            }

            result.add(new CategoryGroupedKpiResponse(
                    categoryId,
                    categoryAccumulator.name,
                    categoryAccumulator.movementType,
                    categoryAccumulator.total,
                    calculatePercent(categoryAccumulator.total, totalByType),
                    subCategories
            ));
        }

        return result;
    }

    private Specification<CashMovement> buildSpecification(
            DashboardKpiRequest request,
            List<Long> accountFilterIds,
            List<Long> categoryFilterIds,
            List<Long> subCategoryFilterIds
    ) {
        return (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("workspace").get("id"), getCurrentWorkspaceId()));

            if (!accountFilterIds.isEmpty()) {
                predicates.add(root.get("account").get("id").in(accountFilterIds));
            }
            if (!categoryFilterIds.isEmpty()) {
                predicates.add(root.get("subCategory").get("category").get("id").in(categoryFilterIds));
            }
            if (!subCategoryFilterIds.isEmpty()) {
                predicates.add(root.get("subCategory").get("id").in(subCategoryFilterIds));
            }
            if (request.startDate() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("occurredAt"), request.startDate()));
            }
            if (request.endDate() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("occurredAt"), request.endDate()));
            }
            if (request.paymentMethod() != null) {
                predicates.add(cb.equal(root.get("paymentMethod"), request.paymentMethod()));
            }
            if (request.movementType() != null) {
                predicates.add(cb.equal(root.get("movementType"), request.movementType()));
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
    }

    private List<Long> normalizeIds(List<Long> multipleIds) {
        LinkedHashSet<Long> ids = new LinkedHashSet<>();

        if (multipleIds != null) {
            multipleIds.stream()
                    .filter(id -> id != null)
                    .forEach(ids::add);
        }

        return new ArrayList<>(ids);
    }

    private static final class CategoryAccumulator {
        private final String name;
        private final MovementType movementType;
        private BigDecimal total = BigDecimal.ZERO;
        private final Map<Long, SubCategoryAccumulator> subCategories = new LinkedHashMap<>();

        private CategoryAccumulator(String name, MovementType movementType) {
            this.name = name;
            this.movementType = movementType;
        }
    }

    private static final class SubCategoryAccumulator {
        private final String name;
        private BigDecimal total = BigDecimal.ZERO;

        private SubCategoryAccumulator(String name) {
            this.name = name;
        }
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
