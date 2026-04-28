package com.meufluxo.service;

import com.meufluxo.dto.kpi.CategoryGroupedKpiResponse;
import com.meufluxo.dto.kpi.DashboardKpiRequest;
import com.meufluxo.dto.kpi.DashboardKpiResponse;
import com.meufluxo.dto.kpi.SubCategoryGroupedKpiResponse;
import com.meufluxo.enums.FinancialDirection;
import com.meufluxo.enums.MovementType;
import com.meufluxo.enums.PlannedEntryStatus;
import com.meufluxo.model.CashMovement;
import com.meufluxo.model.PlannedEntry;
import com.meufluxo.repository.AccountRepository;
import com.meufluxo.repository.CashMovementRepository;
import com.meufluxo.repository.PlannedEntryRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;

@Service
public class KpiService extends BaseUserService {

    private final AccountRepository accountRepository;
    private final CashMovementRepository cashMovementRepository;
    private final PlannedEntryRepository plannedEntryRepository;
    private final AccountService accountService;
    private final CategoryService categoryService;
    private final SubCategoryService subCategoryService;

    public KpiService(
            CurrentUserService currentUserService,
            AccountRepository accountRepository,
            CashMovementRepository cashMovementRepository,
            PlannedEntryRepository plannedEntryRepository,
            AccountService accountService,
            CategoryService categoryService,
            SubCategoryService subCategoryService
    ) {
        super(currentUserService);
        this.accountRepository = accountRepository;
        this.cashMovementRepository = cashMovementRepository;
        this.plannedEntryRepository = plannedEntryRepository;
        this.accountService = accountService;
        this.categoryService = categoryService;
        this.subCategoryService = subCategoryService;
    }

    @Transactional(readOnly = true)
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

        List<KpiAmountLine> lines = new ArrayList<>(toLinesFromCashMovements(filteredMovements));

        if (Boolean.TRUE.equals(request.includeProjections())) {
            lines.addAll(loadOpenPlannedLines(request, accountFilterIds, categoryFilterIds, subCategoryFilterIds));
        }

        BigDecimal totalIncome = sumByMovementType(lines, MovementType.INCOME);
        BigDecimal totalExpense = sumByMovementType(lines, MovementType.EXPENSE);

        BigDecimal netBalance = totalIncome.subtract(totalExpense);

        List<CategoryGroupedKpiResponse> expensesByCategory = buildCategoryGroupedKpisFromLines(
                lines,
                totalExpense,
                MovementType.EXPENSE
        );
        List<CategoryGroupedKpiResponse> incomesByCategory = buildCategoryGroupedKpisFromLines(
                lines,
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

    private List<KpiAmountLine> toLinesFromCashMovements(List<CashMovement> movements) {
        List<KpiAmountLine> lines = new ArrayList<>();
        for (CashMovement movement : movements) {
            if (movement.getSubCategory() == null || movement.getSubCategory().getCategory() == null) {
                continue;
            }
            lines.add(new KpiAmountLine(
                    movement.getMovementType(),
                    defaultIfNull(movement.getAmount()),
                    movement.getSubCategory().getCategory().getId(),
                    movement.getSubCategory().getCategory().getName(),
                    movement.getSubCategory().getCategory().getMovementType(),
                    movement.getSubCategory().getId(),
                    movement.getSubCategory().getName()
            ));
        }
        return lines;
    }

    private List<KpiAmountLine> loadOpenPlannedLines(
            DashboardKpiRequest request,
            List<Long> accountFilterIds,
            List<Long> categoryFilterIds,
            List<Long> subCategoryFilterIds
    ) {
        List<KpiAmountLine> lines = new ArrayList<>();
        Long workspaceId = getCurrentWorkspaceId();
        MovementType movementFilter = request.movementType();

        if (movementFilter == null || movementFilter == MovementType.EXPENSE) {
            lines.addAll(plannedEntryRepository.findAll(
                    openPlannedSpecification(
                            workspaceId,
                            request.startDate(),
                            request.endDate(),
                            accountFilterIds,
                            categoryFilterIds,
                            subCategoryFilterIds,
                            FinancialDirection.EXPENSE
                    )
            ).stream().map(this::toLineFromPlanned).toList());
        }
        if (movementFilter == null || movementFilter == MovementType.INCOME) {
            lines.addAll(plannedEntryRepository.findAll(
                    openPlannedSpecification(
                            workspaceId,
                            request.startDate(),
                            request.endDate(),
                            accountFilterIds,
                            categoryFilterIds,
                            subCategoryFilterIds,
                            FinancialDirection.INCOME
                    )
            ).stream().map(this::toLineFromPlanned).toList());
        }
        return lines;
    }

    private KpiAmountLine toLineFromPlanned(PlannedEntry entry) {
        MovementType movementType = entry.getDirection() == FinancialDirection.INCOME
                ? MovementType.INCOME
                : MovementType.EXPENSE;
        var category = entry.getCategory();
        var sub = entry.getSubCategory();
        if (sub == null) {
            return new KpiAmountLine(
                    movementType,
                    defaultIfNull(entry.getExpectedAmount()),
                    category.getId(),
                    category.getName(),
                    category.getMovementType(),
                    category.getId(),
                    "—"
            );
        }
        return new KpiAmountLine(
                movementType,
                defaultIfNull(entry.getExpectedAmount()),
                category.getId(),
                category.getName(),
                category.getMovementType(),
                sub.getId(),
                sub.getName()
        );
    }

    private Specification<PlannedEntry> openPlannedSpecification(
            Long workspaceId,
            java.time.LocalDate start,
            java.time.LocalDate end,
            List<Long> accountFilterIds,
            List<Long> categoryFilterIds,
            List<Long> subCategoryFilterIds,
            FinancialDirection direction
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("workspace").get("id"), workspaceId));
            predicates.add(cb.equal(root.get("direction"), direction));
            predicates.add(cb.equal(root.get("status"), PlannedEntryStatus.OPEN));
            /*
             * No período filtrado: vencimento entre start e end.
             * Também inclui contas em atraso ainda OPEN com vencimento antes do início do período
             * (saldo de obrigações/recebíveis não liquidados).
             */
            Predicate dueInSelectedPeriod = cb.and(
                    cb.greaterThanOrEqualTo(root.get("dueDate"), start),
                    cb.lessThanOrEqualTo(root.get("dueDate"), end)
            );
            Predicate overdueBeforePeriod = cb.lessThan(root.get("dueDate"), start);
            predicates.add(cb.or(dueInSelectedPeriod, overdueBeforePeriod));
            if (!accountFilterIds.isEmpty()) {
                predicates.add(root.get("defaultAccount").get("id").in(accountFilterIds));
            }
            if (!categoryFilterIds.isEmpty()) {
                predicates.add(root.get("category").get("id").in(categoryFilterIds));
            }
            if (!subCategoryFilterIds.isEmpty()) {
                predicates.add(root.get("subCategory").get("id").in(subCategoryFilterIds));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private BigDecimal sumByMovementType(List<KpiAmountLine> lines, MovementType movementType) {
        return lines.stream()
                .filter(line -> line.movementType() == movementType)
                .map(KpiAmountLine::amount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private List<CategoryGroupedKpiResponse> buildCategoryGroupedKpisFromLines(
            List<KpiAmountLine> lines,
            BigDecimal totalByType,
            MovementType targetType
    ) {
        Map<Long, CategoryAccumulator> categoryMap = new LinkedHashMap<>();

        for (KpiAmountLine line : lines) {
            if (line.movementType() != targetType) {
                continue;
            }

            Long categoryId = line.categoryId();
            String categoryName = line.categoryName();
            MovementType categoryMovementType = line.categoryMovementType();
            Long subCategoryId = line.subCategoryId();
            String subCategoryName = line.subCategoryName();
            BigDecimal amount = line.amount();

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

    private record KpiAmountLine(
            MovementType movementType,
            BigDecimal amount,
            Long categoryId,
            String categoryName,
            MovementType categoryMovementType,
            Long subCategoryId,
            String subCategoryName
    ) {
    }
}
