package com.meufluxo.service;

import com.meufluxo.dto.kpi.CategoryGroupedKpiResponse;
import com.meufluxo.dto.kpi.DashboardKpiRequest;
import com.meufluxo.dto.kpi.DashboardKpiResponse;
import com.meufluxo.dto.kpi.InvoicePaymentAllocationLineResponse;
import com.meufluxo.dto.kpi.InvoicePaymentBreakdownResponse;
import com.meufluxo.dto.kpi.SubCategoryGroupedKpiResponse;
import com.meufluxo.enums.FinancialDirection;
import com.meufluxo.enums.MovementType;
import com.meufluxo.enums.PaymentMethod;
import com.meufluxo.enums.PlannedEntryStatus;
import com.meufluxo.model.CashMovement;
import com.meufluxo.model.CreditCardExpense;
import com.meufluxo.model.CreditCardInvoice;
import com.meufluxo.model.CreditCardInvoicePayment;
import com.meufluxo.model.PlannedEntry;
import com.meufluxo.repository.AccountRepository;
import com.meufluxo.repository.CashMovementRepository;
import com.meufluxo.repository.CreditCardExpenseRepository;
import com.meufluxo.repository.CreditCardInvoicePaymentRepository;
import com.meufluxo.repository.PlannedEntryRepository;
import com.meufluxo.service.kpi.InvoicePaymentExpenseAllocation;
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
import java.util.Set;

@Service
public class KpiService extends BaseUserService {

    private final AccountRepository accountRepository;
    private final CashMovementRepository cashMovementRepository;
    private final PlannedEntryRepository plannedEntryRepository;
    private final CreditCardInvoicePaymentRepository creditCardInvoicePaymentRepository;
    private final CreditCardExpenseRepository creditCardExpenseRepository;
    private final AccountService accountService;
    private final CategoryService categoryService;
    private final SubCategoryService subCategoryService;

    public KpiService(
            CurrentUserService currentUserService,
            AccountRepository accountRepository,
            CashMovementRepository cashMovementRepository,
            PlannedEntryRepository plannedEntryRepository,
            CreditCardInvoicePaymentRepository creditCardInvoicePaymentRepository,
            CreditCardExpenseRepository creditCardExpenseRepository,
            AccountService accountService,
            CategoryService categoryService,
            SubCategoryService subCategoryService
    ) {
        super(currentUserService);
        this.accountRepository = accountRepository;
        this.cashMovementRepository = cashMovementRepository;
        this.plannedEntryRepository = plannedEntryRepository;
        this.creditCardInvoicePaymentRepository = creditCardInvoicePaymentRepository;
        this.creditCardExpenseRepository = creditCardExpenseRepository;
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
        List<InvoicePaymentBreakdownResponse> invoicePaymentBreakdowns =
                buildInvoicePaymentBreakdownResponses(filteredMovements);
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
                incomesByCategory,
                invoicePaymentBreakdowns
        );
    }

    /**
     * Detalhamento de pagamentos de fatura no período (mesma base de filtros do dashboard),
     * para exibir despesas do cartão nas categorias reais na UI de movimentações.
     */
    @Transactional(readOnly = true)
    public List<InvoicePaymentBreakdownResponse> getInvoicePaymentBreakdowns(DashboardKpiRequest request) {
        validatePeriod(request);

        List<Long> accountFilterIds = normalizeIds(request.accountIds());
        List<Long> categoryFilterIds = normalizeIds(request.categoryIds());
        List<Long> subCategoryFilterIds = normalizeIds(request.subCategoryIds());

        accountFilterIds.forEach(accountService::existsId);
        categoryFilterIds.forEach(categoryService::existsId);
        subCategoryFilterIds.forEach(subCategoryService::existsId);

        Specification<CashMovement> specification = buildSpecification(
                request,
                accountFilterIds,
                categoryFilterIds,
                subCategoryFilterIds
        );
        List<CashMovement> filteredMovements = cashMovementRepository.findAll(specification);
        return buildInvoicePaymentBreakdownResponses(filteredMovements);
    }

    private List<InvoicePaymentBreakdownResponse> buildInvoicePaymentBreakdownResponses(
            List<CashMovement> filteredMovements
    ) {
        InvoicePaymentContext ctx = loadInvoicePaymentContext(filteredMovements, getCurrentWorkspaceId());
        List<InvoicePaymentBreakdownResponse> out = new ArrayList<>();
        for (CashMovement movement : filteredMovements) {
            if (movement.getId() == null
                    || movement.getMovementType() != MovementType.EXPENSE
                    || movement.getPaymentMethod() != PaymentMethod.INVOICE_CREDIT_CARD) {
                continue;
            }
            CreditCardInvoicePayment payment = ctx.paymentByMovementId().get(movement.getId());
            CreditCardInvoice invoice = resolveInvoiceForInvoicePaymentMovement(movement, payment);
            if (invoice == null || invoice.getId() == null) {
                continue;
            }
            List<CreditCardExpense> exps = ctx.expensesByInvoice().getOrDefault(invoice.getId(), List.of());
            List<InvoicePaymentAllocationLineResponse> lines = InvoicePaymentExpenseAllocation.toAllocationLines(
                    defaultIfNull(movement.getAmount()),
                    exps
            );
            if (lines.isEmpty()) {
                continue;
            }
            var inv = invoice;
            java.time.LocalDate due = inv.getDueDate() != null ? inv.getDueDate() : movement.getOccurredAt();
            out.add(new InvoicePaymentBreakdownResponse(
                    movement.getId(),
                    inv.getId(),
                    due,
                    defaultIfNull(movement.getAmount()),
                    lines
            ));
        }
        return out;
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
        InvoicePaymentContext ctx = loadInvoicePaymentContext(movements, getCurrentWorkspaceId());
        List<KpiAmountLine> lines = new ArrayList<>();
        for (CashMovement movement : movements) {
            if (movement.getSubCategory() == null || movement.getSubCategory().getCategory() == null) {
                continue;
            }
            if (movement.getMovementType() == MovementType.EXPENSE
                    && movement.getPaymentMethod() == PaymentMethod.INVOICE_CREDIT_CARD
                    && movement.getId() != null) {
                CreditCardInvoicePayment payment = ctx.paymentByMovementId().get(movement.getId());
                CreditCardInvoice invoice = resolveInvoiceForInvoicePaymentMovement(movement, payment);
                if (invoice != null && invoice.getId() != null) {
                    List<CreditCardExpense> exps = ctx.expensesByInvoice().getOrDefault(
                            invoice.getId(),
                            List.of()
                    );
                    List<InvoicePaymentAllocationLineResponse> allocation = InvoicePaymentExpenseAllocation
                            .toAllocationLines(defaultIfNull(movement.getAmount()), exps);
                    if (!allocation.isEmpty()) {
                        for (var view : InvoicePaymentExpenseAllocation.allocationToKpiLineViews(allocation)) {
                            lines.add(new KpiAmountLine(
                                    view.movementType(),
                                    view.amount(),
                                    view.categoryId(),
                                    view.categoryName(),
                                    view.categoryMovementType(),
                                    view.subCategoryId(),
                                    view.subCategoryName()
                            ));
                        }
                        continue;
                    }
                }
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

    private InvoicePaymentContext loadInvoicePaymentContext(List<CashMovement> movements, Long workspaceId) {
        List<Long> invoiceMovementIds = new ArrayList<>();
        for (CashMovement m : movements) {
            if (m.getId() != null
                    && m.getMovementType() == MovementType.EXPENSE
                    && m.getPaymentMethod() == PaymentMethod.INVOICE_CREDIT_CARD) {
                invoiceMovementIds.add(m.getId());
            }
        }
        Map<Long, CreditCardInvoicePayment> paymentByMovementId = new LinkedHashMap<>();
        if (!invoiceMovementIds.isEmpty()) {
            for (CreditCardInvoicePayment p : creditCardInvoicePaymentRepository.findAllByMovementIdInAndWorkspaceId(
                    invoiceMovementIds,
                    workspaceId
            )) {
                if (p.getMovement() != null && p.getMovement().getId() != null) {
                    paymentByMovementId.put(p.getMovement().getId(), p);
                }
            }
        }
        Set<Long> invoiceIds = new LinkedHashSet<>();
        for (CreditCardInvoicePayment p : paymentByMovementId.values()) {
            if (p.getInvoice() != null && p.getInvoice().getId() != null) {
                invoiceIds.add(p.getInvoice().getId());
            }
        }
        /* Fatura ligada diretamente ao movimento (ex.: legado sem linha em credit_card_invoice_payments). */
        for (CashMovement m : movements) {
            if (m.getMovementType() == MovementType.EXPENSE
                    && m.getPaymentMethod() == PaymentMethod.INVOICE_CREDIT_CARD
                    && m.getCreditCardInvoice() != null
                    && m.getCreditCardInvoice().getId() != null) {
                invoiceIds.add(m.getCreditCardInvoice().getId());
            }
        }
        Map<Long, List<CreditCardExpense>> expensesByInvoice = new LinkedHashMap<>();
        if (!invoiceIds.isEmpty()) {
            List<CreditCardExpense> all = creditCardExpenseRepository.findAllByInvoiceIdInAndWorkspaceIdForKpi(
                    invoiceIds,
                    workspaceId
            );
            for (CreditCardExpense e : all) {
                if (e.getInvoice() == null || e.getInvoice().getId() == null) {
                    continue;
                }
                expensesByInvoice.computeIfAbsent(e.getInvoice().getId(), k -> new ArrayList<>()).add(e);
            }
        }
        return new InvoicePaymentContext(paymentByMovementId, expensesByInvoice);
    }

    /**
     * Prioriza o pagamento oficial; senão usa {@link CashMovement#getCreditCardInvoice()} preenchido na criação do pagamento.
     */
    private static CreditCardInvoice resolveInvoiceForInvoicePaymentMovement(
            CashMovement movement,
            CreditCardInvoicePayment payment
    ) {
        if (payment != null && payment.getInvoice() != null) {
            return payment.getInvoice();
        }
        if (movement.getCreditCardInvoice() != null) {
            return movement.getCreditCardInvoice();
        }
        return null;
    }

    private record InvoicePaymentContext(
            Map<Long, CreditCardInvoicePayment> paymentByMovementId,
            Map<Long, List<CreditCardExpense>> expensesByInvoice
    ) {
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
