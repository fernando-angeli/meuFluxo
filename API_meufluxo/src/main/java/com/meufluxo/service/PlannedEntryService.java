package com.meufluxo.service;

import com.meufluxo.common.dto.PageResponse;
import com.meufluxo.common.exception.BusinessException;
import com.meufluxo.common.exception.NotFoundException;
import com.meufluxo.dto.plannedEntry.*;
import com.meufluxo.enums.FinancialDirection;
import com.meufluxo.enums.MovementType;
import com.meufluxo.enums.PlannedEntryOriginType;
import com.meufluxo.enums.PlannedEntryStatus;
import com.meufluxo.mapper.PlannedEntryMapper;
import com.meufluxo.model.Account;
import com.meufluxo.model.Category;
import com.meufluxo.model.PlannedEntry;
import com.meufluxo.model.SubCategory;
import com.meufluxo.repository.PlannedEntryRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
public class PlannedEntryService extends BaseUserService {

    private final PlannedEntryRepository plannedEntryRepository;
    private final PlannedEntryMapper plannedEntryMapper;
    private final CategoryService categoryService;
    private final SubCategoryService subCategoryService;
    private final AccountService accountService;
    private final BusinessDayService businessDayService;

    public PlannedEntryService(
            CurrentUserService currentUserService,
            PlannedEntryRepository plannedEntryRepository,
            PlannedEntryMapper plannedEntryMapper,
            CategoryService categoryService,
            SubCategoryService subCategoryService,
            AccountService accountService,
            BusinessDayService businessDayService
    ) {
        super(currentUserService);
        this.plannedEntryRepository = plannedEntryRepository;
        this.plannedEntryMapper = plannedEntryMapper;
        this.categoryService = categoryService;
        this.subCategoryService = subCategoryService;
        this.accountService = accountService;
        this.businessDayService = businessDayService;
    }

    @Transactional
    public PlannedEntryResponse createExpense(PlannedEntryCreateRequest request) {
        return createPlannedEntry(request, FinancialDirection.EXPENSE);
    }

    @Transactional
    public PlannedEntryResponse createIncome(PlannedEntryCreateRequest request) {
        return createPlannedEntry(request, FinancialDirection.INCOME);
    }

    @Transactional
    public PlannedEntryBatchCreateResponse createExpenseBatch(PlannedEntryBatchCreateRequest request) {
        return createBatch(request, FinancialDirection.EXPENSE);
    }

    @Transactional
    public PlannedEntryBatchCreateResponse createIncomeBatch(PlannedEntryBatchCreateRequest request) {
        return createBatch(request, FinancialDirection.INCOME);
    }

    private PlannedEntryResponse createPlannedEntry(PlannedEntryCreateRequest request, FinancialDirection direction) {
        PlannedEntry entry = plannedEntryMapper.toEntity(request);
        applyCommonRelations(entry, direction, request.categoryId(), request.subCategoryId(), request.defaultAccountId());

        entry.setDirection(direction);
        entry.setStatus(PlannedEntryStatus.OPEN);
        entry.setOriginType(PlannedEntryOriginType.SINGLE);
        entry.setGroupId(null);
        entry.setWorkspace(getCurrentWorkspace());
        entry.setDueDate(adjustDueDate(entry.getDueDate()));
        entry.setIssueDate(Optional.ofNullable(request.issueDate()).orElse(entry.getDueDate()));
        entry.setDocument(trimToNull(request.document()));
        entry.setDescription(trimToNull(request.description()));
        entry.setNotes(trimToNull(request.notes()));
        entry = plannedEntryRepository.save(entry);

        return withComputedStatus(plannedEntryMapper.toResponse(entry));
    }

    private PlannedEntryBatchCreateResponse createBatch(PlannedEntryBatchCreateRequest request, FinancialDirection direction) {
        validateBatchEntries(request);
        UUID groupId = UUID.randomUUID();

        Category category = validateAndGetCategoryForDirection(request.categoryId(), direction);
        SubCategory subCategory = validateAndGetSubCategory(request.subCategoryId(), category);
        Account defaultAccount = validateAndGetAccount(request.defaultAccountId());
        String description = trimToNull(request.description());
        String notes = trimToNull(request.notes());
        String rootDocument = trimToNull(request.document());

        List<PlannedEntryBatchItemRequest> orderedItems = request.entries()
                .stream()
                .sorted(Comparator.comparing(PlannedEntryBatchItemRequest::order))
                .toList();

        List<PlannedEntry> entries = new ArrayList<>();
        for (PlannedEntryBatchItemRequest item : orderedItems) {
            PlannedEntry entry = new PlannedEntry();
            entry.setWorkspace(getCurrentWorkspace());
            entry.setDirection(direction);
            entry.setDescription(description);
            entry.setCategory(category);
            entry.setSubCategory(subCategory);
            entry.setExpectedAmount(item.expectedAmount());
            entry.setAmountBehavior(request.amountBehavior());
            entry.setDueDate(adjustDueDate(item.dueDate()));
            entry.setStatus(PlannedEntryStatus.OPEN);
            entry.setDefaultAccount(defaultAccount);
            entry.setGroupId(groupId);
            entry.setOriginType(PlannedEntryOriginType.BATCH_MANUAL);
            entry.setNotes(notes);
            entry.setIssueDate(firstNonNull(item.issueDate(), request.issueDate(), entry.getDueDate()));
            entry.setDocument(firstNonNull(trimToNull(item.document()), rootDocument));
            entries.add(entry);
        }

        List<PlannedEntry> savedEntries;
        try {
            savedEntries = plannedEntryRepository.saveAll(entries);
        } catch (DataIntegrityViolationException ex) {
            throw new BusinessException("Falha de integridade ao salvar lote de lançamentos. Revise categoria, subcategoria, conta e documentos informados.");
        }

        List<PlannedEntryResponse> responses = savedEntries.stream()
                .map(plannedEntryMapper::toResponse)
                .map(this::withComputedStatus)
                .toList();

        return new PlannedEntryBatchCreateResponse(groupId, responses);
    }

    @Transactional(readOnly = true)
    public PlannedEntryResponse findExpenseById(Long id) {
        PlannedEntry entry = findByIdOrThrow(id, FinancialDirection.EXPENSE);
        return withComputedStatus(plannedEntryMapper.toResponse(entry));
    }

    @Transactional(readOnly = true)
    public PlannedEntryResponse findIncomeById(Long id) {
        PlannedEntry entry = findByIdOrThrow(id, FinancialDirection.INCOME);
        return withComputedStatus(plannedEntryMapper.toResponse(entry));
    }

    @Transactional(readOnly = true)
    public PageResponse<PlannedEntryResponse> findExpenses(
            PlannedEntryStatus status,
            com.meufluxo.enums.PlannedAmountBehavior amountBehavior,
            LocalDate issueDate,
            LocalDate issueDateStart,
            LocalDate issueDateEnd,
            LocalDate dueDateStart,
            LocalDate dueDateEnd,
            String document,
            Long categoryId,
            Long subCategoryId,
            UUID groupId,
            Pageable pageable
    ) {
        return findByDirection(
                FinancialDirection.EXPENSE,
                status,
                amountBehavior,
                issueDate,
                issueDateStart,
                issueDateEnd,
                dueDateStart,
                dueDateEnd,
                document,
                categoryId,
                subCategoryId,
                groupId,
                pageable
        );
    }

    @Transactional(readOnly = true)
    public PageResponse<PlannedEntryResponse> findIncomes(
            PlannedEntryStatus status,
            com.meufluxo.enums.PlannedAmountBehavior amountBehavior,
            LocalDate issueDate,
            LocalDate issueDateStart,
            LocalDate issueDateEnd,
            LocalDate dueDateStart,
            LocalDate dueDateEnd,
            String document,
            Long categoryId,
            Long subCategoryId,
            UUID groupId,
            Pageable pageable
    ) {
        return findByDirection(
                FinancialDirection.INCOME,
                status,
                amountBehavior,
                issueDate,
                issueDateStart,
                issueDateEnd,
                dueDateStart,
                dueDateEnd,
                document,
                categoryId,
                subCategoryId,
                groupId,
                pageable
        );
    }

    @Transactional
    public PlannedEntryResponse updateExpense(Long id, PlannedEntryUpdateRequest request) {
        return updateByDirection(id, request, FinancialDirection.EXPENSE);
    }

    @Transactional
    public PlannedEntryResponse updateIncome(Long id, PlannedEntryUpdateRequest request) {
        return updateByDirection(id, request, FinancialDirection.INCOME);
    }

    @Transactional
    public PlannedEntryResponse cancelExpense(Long id) {
        return cancelByDirection(id, FinancialDirection.EXPENSE);
    }

    @Transactional
    public PlannedEntryResponse cancelIncome(Long id) {
        return cancelByDirection(id, FinancialDirection.INCOME);
    }

    @Transactional
    public PlannedEntryFutureOpenUpdateResponse updateExpenseFutureOpen(
            Long referenceId,
            PlannedEntryFutureOpenUpdateRequest request
    ) {
        return updateFutureOpenByDirection(referenceId, request, FinancialDirection.EXPENSE);
    }

    @Transactional
    public PlannedEntryFutureOpenUpdateResponse updateIncomeFutureOpen(
            Long referenceId,
            PlannedEntryFutureOpenUpdateRequest request
    ) {
        return updateFutureOpenByDirection(referenceId, request, FinancialDirection.INCOME);
    }

    private PlannedEntryFutureOpenUpdateResponse updateFutureOpenByDirection(
            Long referenceId,
            PlannedEntryFutureOpenUpdateRequest request,
            FinancialDirection direction
    ) {
        PlannedEntry referenceEntry = findByIdOrThrow(referenceId, direction);
        if (referenceEntry.getGroupId() == null) {
            throw new BusinessException("Lançamento não pertence a um grupo de lote manual.");
        }

        Category category = request.categoryId() == null
                ? referenceEntry.getCategory()
                : validateAndGetCategoryForDirection(request.categoryId(), direction);

        SubCategory subCategory = request.subCategoryId() == null
                ? referenceEntry.getSubCategory()
                : validateAndGetSubCategory(request.subCategoryId(), category);

        Account defaultAccount = request.defaultAccountId() == null
                ? referenceEntry.getDefaultAccount()
                : validateAndGetAccount(request.defaultAccountId());

        List<PlannedEntry> futureOpenEntries =
                plannedEntryRepository.findByWorkspaceIdAndDirectionAndGroupIdAndStatusAndDueDateGreaterThanEqualOrderByDueDateAsc(
                        getCurrentWorkspaceId(),
                        direction,
                        referenceEntry.getGroupId(),
                        PlannedEntryStatus.OPEN,
                        referenceEntry.getDueDate()
                );

        for (PlannedEntry entry : futureOpenEntries) {
            if (request.expectedAmount() != null) {
                entry.setExpectedAmount(request.expectedAmount());
            }
            if (request.description() != null) {
                entry.setDescription(trimToNull(request.description()));
            }
            if (request.notes() != null) {
                entry.setNotes(trimToNull(request.notes()));
            }
            if (request.issueDate() != null) {
                entry.setIssueDate(request.issueDate());
            }
            if (request.document() != null) {
                entry.setDocument(trimToNull(request.document()));
            }

            if (request.categoryId() != null) {
                entry.setCategory(category);
            }
            if (request.subCategoryId() != null) {
                entry.setSubCategory(subCategory);
            }
            if (request.defaultAccountId() != null) {
                entry.setDefaultAccount(defaultAccount);
            }
        }

        plannedEntryRepository.saveAll(futureOpenEntries);
        return new PlannedEntryFutureOpenUpdateResponse(referenceEntry.getGroupId(), futureOpenEntries.size());
    }

    private PageResponse<PlannedEntryResponse> findByDirection(
            FinancialDirection direction,
            PlannedEntryStatus status,
            com.meufluxo.enums.PlannedAmountBehavior amountBehavior,
            LocalDate issueDate,
            LocalDate issueDateStart,
            LocalDate issueDateEnd,
            LocalDate dueDateStart,
            LocalDate dueDateEnd,
            String document,
            Long categoryId,
            Long subCategoryId,
            UUID groupId,
            Pageable pageable
    ) {
        Optional.ofNullable(categoryId).ifPresent(categoryService::existsId);
        Optional.ofNullable(subCategoryId).ifPresent(subCategoryService::existsId);

        if (dueDateStart != null && dueDateEnd != null && dueDateStart.isAfter(dueDateEnd)) {
            throw new BusinessException("Intervalo de data inválido: dueDateStart maior que dueDateEnd.");
        }
        if (issueDateStart != null && issueDateEnd != null && issueDateStart.isAfter(issueDateEnd)) {
            throw new BusinessException("Intervalo de data inválido: issueDateStart maior que issueDateEnd.");
        }

        Specification<PlannedEntry> specification = buildSpecification(
                direction,
                status,
                amountBehavior,
                issueDate,
                issueDateStart,
                issueDateEnd,
                dueDateStart,
                dueDateEnd,
                trimToNull(document),
                categoryId,
                subCategoryId,
                groupId
        );

        Page<PlannedEntry> page = plannedEntryRepository.findAll(specification, pageable);
        Page<PlannedEntryResponse> responsePage = page.map(plannedEntryMapper::toResponse).map(this::withComputedStatus);
        return PageResponse.toPageResponse(responsePage);
    }

    private PlannedEntryResponse updateByDirection(Long id, PlannedEntryUpdateRequest request, FinancialDirection direction) {
        PlannedEntry entry = findByIdOrThrow(id, direction);
        applyUpdate(
                entry,
                request.categoryId(),
                request.subCategoryId(),
                request.defaultAccountId(),
                request.description(),
                request.notes(),
                request.issueDate(),
                request.document()
        );

        if (request.expectedAmount() != null) {
            entry.setExpectedAmount(request.expectedAmount());
        }
        if (request.amountBehavior() != null) {
            entry.setAmountBehavior(request.amountBehavior());
        }
        if (request.dueDate() != null) {
            entry.setDueDate(adjustDueDate(request.dueDate()));
        }

        PlannedEntry saved = plannedEntryRepository.save(entry);
        return withComputedStatus(plannedEntryMapper.toResponse(saved));
    }

    private PlannedEntryResponse cancelByDirection(Long id, FinancialDirection direction) {
        PlannedEntry entry = findByIdOrThrow(id, direction);
        entry.setStatus(PlannedEntryStatus.CANCELED);
        PlannedEntry saved = plannedEntryRepository.save(entry);
        return withComputedStatus(plannedEntryMapper.toResponse(saved));
    }

    private Specification<PlannedEntry> buildSpecification(
            FinancialDirection direction,
            PlannedEntryStatus status,
            com.meufluxo.enums.PlannedAmountBehavior amountBehavior,
            LocalDate issueDate,
            LocalDate issueDateStart,
            LocalDate issueDateEnd,
            LocalDate dueDateStart,
            LocalDate dueDateEnd,
            String document,
            Long categoryId,
            Long subCategoryId,
            UUID groupId
    ) {
        return (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("workspace").get("id"), getCurrentWorkspaceId()));
            predicates.add(cb.equal(root.get("direction"), direction));

            if (status != null) {
                if (status == PlannedEntryStatus.OVERDUE) {
                    predicates.add(cb.equal(root.get("status"), PlannedEntryStatus.OPEN));
                    predicates.add(cb.lessThan(root.get("dueDate"), LocalDate.now()));
                } else if (status == PlannedEntryStatus.OPEN) {
                    predicates.add(cb.equal(root.get("status"), PlannedEntryStatus.OPEN));
                    predicates.add(cb.greaterThanOrEqualTo(root.get("dueDate"), LocalDate.now()));
                } else {
                    predicates.add(cb.equal(root.get("status"), status));
                }
            }
            if (amountBehavior != null) {
                predicates.add(cb.equal(root.get("amountBehavior"), amountBehavior));
            }
            if (issueDate != null) {
                predicates.add(cb.equal(root.get("issueDate"), issueDate));
            }
            if (issueDateStart != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("issueDate"), issueDateStart));
            }
            if (issueDateEnd != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("issueDate"), issueDateEnd));
            }
            if (dueDateStart != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("dueDate"), dueDateStart));
            }
            if (dueDateEnd != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("dueDate"), dueDateEnd));
            }
            if (document != null) {
                predicates.add(cb.like(cb.lower(root.get("document")), "%" + document.toLowerCase() + "%"));
            }
            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }
            if (subCategoryId != null) {
                predicates.add(cb.equal(root.get("subCategory").get("id"), subCategoryId));
            }
            if (groupId != null) {
                predicates.add(cb.equal(root.get("groupId"), groupId));
            }
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
    }

    private PlannedEntry findByIdOrThrow(Long id, FinancialDirection direction) {
        return plannedEntryRepository.findByIdAndWorkspaceIdAndDirection(id, getCurrentWorkspaceId(), direction)
                .orElseThrow(() -> new NotFoundException("Lançamento planejado não encontrado com ID: " + id));
    }

    private Category validateAndGetCategoryForDirection(Long categoryId, FinancialDirection direction) {
        Category category = categoryService.findByIdOrThrow(categoryId);
        MovementType expectedMovementType = direction == FinancialDirection.EXPENSE
                ? MovementType.EXPENSE
                : MovementType.INCOME;
        if (category.getMovementType() != expectedMovementType) {
            throw new BusinessException("Categoria incompatível com a direção do lançamento.");
        }
        return category;
    }

    private SubCategory validateAndGetSubCategory(Long subCategoryId, Category category) {
        if (subCategoryId == null) {
            return null;
        }

        SubCategory subCategory = subCategoryService.findByIdOrThrow(subCategoryId);
        if (!subCategory.getCategory().getId().equals(category.getId())) {
            throw new BusinessException("Subcategoria não pertence à categoria informada.");
        }
        return subCategory;
    }

    private Account validateAndGetAccount(Long accountId) {
        if (accountId == null) {
            return null;
        }
        return accountService.findByIdOrThrow(accountId);
    }

    private void applyCommonRelations(
            PlannedEntry entry,
            FinancialDirection direction,
            Long categoryId,
            Long subCategoryId,
            Long defaultAccountId
    ) {
        Category category = validateAndGetCategoryForDirection(categoryId, direction);
        SubCategory subCategory = validateAndGetSubCategory(subCategoryId, category);
        Account defaultAccount = validateAndGetAccount(defaultAccountId);
        entry.setCategory(category);
        entry.setSubCategory(subCategory);
        entry.setDefaultAccount(defaultAccount);
    }

    private void validateBatchEntries(PlannedEntryBatchCreateRequest request) {
        if (request.entries() == null || request.entries().isEmpty()) {
            throw new BusinessException("Lista de lançamentos é obrigatória e não pode estar vazia.");
        }

        Set<Integer> usedOrders = new HashSet<>();
        for (PlannedEntryBatchItemRequest item : request.entries()) {
            if (item.order() == null || item.order() <= 0) {
                throw new BusinessException("Cada lançamento do lote deve possuir ordem maior que zero.");
            }
            if (!usedOrders.add(item.order())) {
                throw new BusinessException("Existem ordens duplicadas no lote. Cada lançamento deve ter ordem única.");
            }
            if (item.dueDate() == null) {
                throw new BusinessException("Cada lançamento do lote deve possuir data de vencimento.");
            }
            if (item.expectedAmount() == null || item.expectedAmount().signum() <= 0) {
                throw new BusinessException("Cada lançamento do lote deve possuir valor esperado maior que zero.");
            }
        }
    }

    private void applyUpdate(
            PlannedEntry entry,
            Long categoryId,
            Long subCategoryId,
            Long defaultAccountId,
            String description,
            String notes,
            LocalDate issueDate,
            String document
    ) {
        Category targetCategory = categoryId == null
                ? entry.getCategory()
                : validateAndGetCategoryForDirection(categoryId, entry.getDirection());

        if (categoryId != null) {
            entry.setCategory(targetCategory);
            if (subCategoryId == null) {
                entry.setSubCategory(null);
            }
        }

        if (subCategoryId != null) {
            entry.setSubCategory(validateAndGetSubCategory(subCategoryId, targetCategory));
        }

        if (defaultAccountId != null) {
            entry.setDefaultAccount(validateAndGetAccount(defaultAccountId));
        }
        if (description != null) {
            entry.setDescription(trimToNull(description));
        }
        if (notes != null) {
            entry.setNotes(trimToNull(notes));
        }
        if (issueDate != null) {
            entry.setIssueDate(issueDate);
        }
        if (document != null) {
            entry.setDocument(trimToNull(document));
        }
    }

    private LocalDate adjustDueDate(LocalDate dueDate) {
        if (dueDate == null) {
            return null;
        }
        return businessDayService.adjustToNextBusinessDay(dueDate, getCurrentWorkspaceId());
    }

    private PlannedEntryResponse withComputedStatus(PlannedEntryResponse response) {
        // MVP: OVERDUE é derivado em tempo de leitura (OPEN com dueDate no passado),
        // evitando tarefas de atualização periódica do banco nesta fase inicial.
        PlannedEntryStatus effectiveStatus = response.status();
        if (response.status() == PlannedEntryStatus.OPEN
                && response.dueDate() != null
                && response.dueDate().isBefore(LocalDate.now())) {
            effectiveStatus = PlannedEntryStatus.OVERDUE;
        }

        if (effectiveStatus == response.status()) {
            return response;
        }

        return new PlannedEntryResponse(
                response.id(),
                response.direction(),
                response.description(),
                response.categoryId(),
                response.subCategoryId(),
                response.expectedAmount(),
                response.actualAmount(),
                response.amountBehavior(),
                response.dueDate(),
                response.issueDate(),
                response.document(),
                effectiveStatus,
                response.defaultAccountId(),
                response.settledAccountId(),
                response.settledAt(),
                response.movementId(),
                response.groupId(),
                response.originType(),
                response.notes(),
                response.meta()
        );
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    @SafeVarargs
    private static <T> T firstNonNull(T... values) {
        for (T value : values) {
            if (value != null) {
                return value;
            }
        }
        return null;
    }
}
