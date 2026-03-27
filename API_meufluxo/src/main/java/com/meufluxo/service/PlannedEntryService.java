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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
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
        PlannedEntry entry = plannedEntryMapper.toEntity(request);
        applyCommonRelations(entry, FinancialDirection.EXPENSE, request.categoryId(), request.subCategoryId(), request.defaultAccountId());

        entry.setDirection(FinancialDirection.EXPENSE);
        entry.setStatus(PlannedEntryStatus.OPEN);
        entry.setOriginType(PlannedEntryOriginType.SINGLE);
        entry.setGroupId(null);
        entry.setWorkspace(getCurrentWorkspace());
        entry.setDueDate(adjustDueDate(entry.getDueDate()));
        entry.setDescription(trimToNull(request.description()));
        entry.setNotes(trimToNull(request.notes()));
        entry = plannedEntryRepository.save(entry);

        return withComputedStatus(plannedEntryMapper.toResponse(entry));
    }

    @Transactional
    public PlannedEntryBatchCreateResponse createExpenseBatch(PlannedEntryBatchCreateRequest request) {
        UUID groupId = UUID.randomUUID();

        Category category = validateAndGetCategoryForDirection(request.categoryId(), FinancialDirection.EXPENSE);
        SubCategory subCategory = validateAndGetSubCategory(request.subCategoryId(), category);
        Account defaultAccount = validateAndGetAccount(request.defaultAccountId());
        String description = trimToNull(request.description());
        String notes = trimToNull(request.notes());

        List<PlannedEntry> entries = new ArrayList<>();
        for (PlannedEntryBatchItemRequest item : request.entries()) {
            PlannedEntry entry = new PlannedEntry();
            entry.setWorkspace(getCurrentWorkspace());
            entry.setDirection(FinancialDirection.EXPENSE);
            entry.setDescription(description);
            entry.setCategory(category);
            entry.setSubCategory(subCategory);
            entry.setExpectedAmount(item.expectedAmount());
            entry.setAmountBehavior(request.amountBehavior());
            entry.setDueDate(item.dueDate());
            entry.setStatus(PlannedEntryStatus.OPEN);
            entry.setDefaultAccount(defaultAccount);
            entry.setGroupId(groupId);
            entry.setOriginType(PlannedEntryOriginType.BATCH_MANUAL);
            entry.setNotes(notes);
            entries.add(entry);
        }

        List<PlannedEntry> savedEntries = plannedEntryRepository.saveAll(entries);
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
    public PageResponse<PlannedEntryResponse> findExpenses(
            PlannedEntryStatus status,
            com.meufluxo.enums.PlannedAmountBehavior amountBehavior,
            LocalDate dueDateStart,
            LocalDate dueDateEnd,
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

        Specification<PlannedEntry> specification = buildSpecification(
                FinancialDirection.EXPENSE,
                status,
                amountBehavior,
                dueDateStart,
                dueDateEnd,
                categoryId,
                subCategoryId,
                groupId
        );

        Page<PlannedEntry> page = plannedEntryRepository.findAll(specification, pageable);
        Page<PlannedEntryResponse> responsePage = page.map(plannedEntryMapper::toResponse).map(this::withComputedStatus);
        return PageResponse.toPageResponse(responsePage);
    }

    @Transactional
    public PlannedEntryResponse updateExpense(Long id, PlannedEntryUpdateRequest request) {
        PlannedEntry entry = findByIdOrThrow(id, FinancialDirection.EXPENSE);
        applyUpdate(entry, request.categoryId(), request.subCategoryId(), request.defaultAccountId(), request.description(), request.notes());

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

    @Transactional
    public PlannedEntryResponse cancelExpense(Long id) {
        PlannedEntry entry = findByIdOrThrow(id, FinancialDirection.EXPENSE);
        entry.setStatus(PlannedEntryStatus.CANCELED);
        PlannedEntry saved = plannedEntryRepository.save(entry);
        return withComputedStatus(plannedEntryMapper.toResponse(saved));
    }

    @Transactional
    public PlannedEntryFutureOpenUpdateResponse updateExpenseFutureOpen(
            Long referenceId,
            PlannedEntryFutureOpenUpdateRequest request
    ) {
        PlannedEntry referenceEntry = findByIdOrThrow(referenceId, FinancialDirection.EXPENSE);
        if (referenceEntry.getGroupId() == null) {
            throw new BusinessException("Lançamento não pertence a um grupo de lote manual.");
        }

        Category category = request.categoryId() == null
                ? referenceEntry.getCategory()
                : validateAndGetCategoryForDirection(request.categoryId(), FinancialDirection.EXPENSE);

        SubCategory subCategory = request.subCategoryId() == null
                ? referenceEntry.getSubCategory()
                : validateAndGetSubCategory(request.subCategoryId(), category);

        Account defaultAccount = request.defaultAccountId() == null
                ? referenceEntry.getDefaultAccount()
                : validateAndGetAccount(request.defaultAccountId());

        List<PlannedEntry> futureOpenEntries =
                plannedEntryRepository.findByWorkspaceIdAndDirectionAndGroupIdAndStatusAndDueDateGreaterThanEqualOrderByDueDateAsc(
                        getCurrentWorkspaceId(),
                        FinancialDirection.EXPENSE,
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

    private Specification<PlannedEntry> buildSpecification(
            FinancialDirection direction,
            PlannedEntryStatus status,
            com.meufluxo.enums.PlannedAmountBehavior amountBehavior,
            LocalDate dueDateStart,
            LocalDate dueDateEnd,
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
            if (dueDateStart != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("dueDate"), dueDateStart));
            }
            if (dueDateEnd != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("dueDate"), dueDateEnd));
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

    private void applyUpdate(
            PlannedEntry entry,
            Long categoryId,
            Long subCategoryId,
            Long defaultAccountId,
            String description,
            String notes
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
    }

    private LocalDate adjustDueDate(LocalDate dueDate) {
        if (dueDate == null) {
            return null;
        }
        return businessDayService.adjustToNextBusinessDay(dueDate);
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
}
