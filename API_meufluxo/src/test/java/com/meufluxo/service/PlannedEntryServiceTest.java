package com.meufluxo.service;

import com.meufluxo.common.dto.PageResponse;
import com.meufluxo.common.exception.BusinessException;
import com.meufluxo.common.exception.NotFoundException;
import com.meufluxo.dto.BaseResponse;
import com.meufluxo.dto.plannedEntry.*;
import com.meufluxo.enums.*;
import com.meufluxo.mapper.PlannedEntryMapper;
import com.meufluxo.model.Account;
import com.meufluxo.model.Category;
import com.meufluxo.model.PlannedEntry;
import com.meufluxo.model.SubCategory;
import com.meufluxo.model.workspaceAndUsers.Workspace;
import com.meufluxo.repository.CashMovementRepository;
import com.meufluxo.repository.PlannedEntryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PlannedEntryServiceTest {

    @Mock
    private CurrentUserService currentUserService;
    @Mock
    private PlannedEntryRepository plannedEntryRepository;
    @Mock
    private PlannedEntryMapper plannedEntryMapper;
    @Mock
    private CategoryService categoryService;
    @Mock
    private SubCategoryService subCategoryService;
    @Mock
    private AccountService accountService;
    @Mock
    private BusinessDayService businessDayService;
    @Mock
    private CashMovementService cashMovementService;
    @Mock
    private CashMovementRepository cashMovementRepository;

    private PlannedEntryService service;

    @BeforeEach
    void setUp() {
        service = new PlannedEntryService(
                currentUserService,
                plannedEntryRepository,
                plannedEntryMapper,
                categoryService,
                subCategoryService,
                accountService,
                businessDayService,
                cashMovementService,
                cashMovementRepository
        );

        Workspace workspace = new Workspace();
        workspace.setId(10L);
        lenient().when(currentUserService.getCurrentWorkspaceId()).thenReturn(10L);
        lenient().when(currentUserService.getCurrentWorkspace()).thenReturn(workspace);
        lenient().when(businessDayService.adjustToNextBusinessDay(any(LocalDate.class), any()))
                .thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void createSingleExpenseShouldSetSingleOriginWithoutGroup() {
        PlannedEntryCreateRequest request = new PlannedEntryCreateRequest(
                "Academia",
                1L,
                null,
                new BigDecimal("120.00"),
                PlannedAmountBehavior.FIXED,
                LocalDate.now().plusDays(5),
                LocalDate.now().plusDays(1),
                "FAT-001",
                null,
                "mensal"
        );
        Category category = buildExpenseCategory(1L);
        PlannedEntry mapped = new PlannedEntry();
        mapped.setExpectedAmount(request.expectedAmount());
        mapped.setAmountBehavior(request.amountBehavior());
        mapped.setDueDate(request.dueDate());

        when(plannedEntryMapper.toEntity(request)).thenReturn(mapped);
        when(categoryService.findByIdOrThrow(1L)).thenReturn(category);
        when(plannedEntryRepository.save(any(PlannedEntry.class))).thenAnswer(invocation -> {
            PlannedEntry entry = invocation.getArgument(0);
            entry.setId(100L);
            return entry;
        });
        when(plannedEntryMapper.toResponse(any(PlannedEntry.class))).thenAnswer(invocation -> toResponse(invocation.getArgument(0)));

        PlannedEntryResponse response = service.createExpense(request);

        assertEquals(100L, response.id());
        assertEquals(FinancialDirection.EXPENSE, response.direction());
        assertEquals(PlannedEntryOriginType.SINGLE, response.originType());
        assertNull(response.groupId());
        assertEquals(PlannedEntryStatus.OPEN, response.status());
        assertEquals("FAT-001", response.document());
        assertEquals(request.issueDate(), response.issueDate());
    }

    @Test
    void createBatchShouldGenerateEntriesWithSameGroup() {
        PlannedEntryBatchCreateRequest request = new PlannedEntryBatchCreateRequest(
                "Academia",
                1L,
                null,
                PlannedAmountBehavior.FIXED,
                LocalDate.of(2026, 4, 1),
                "A23",
                null,
                null,
                List.of(
                        new PlannedEntryBatchItemRequest(1, LocalDate.of(2026, 4, 10), null, "A23/01", new BigDecimal("120.00")),
                        new PlannedEntryBatchItemRequest(2, LocalDate.of(2026, 4, 24), null, "A23/02", new BigDecimal("130.00")),
                        new PlannedEntryBatchItemRequest(3, LocalDate.of(2026, 5, 15), null, "A23/03", new BigDecimal("140.00"))
                )
        );
        Category category = buildExpenseCategory(1L);

        when(categoryService.findByIdOrThrow(1L)).thenReturn(category);
        when(plannedEntryRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(plannedEntryMapper.toResponse(any(PlannedEntry.class))).thenAnswer(invocation -> toResponse(invocation.getArgument(0)));

        PlannedEntryBatchCreateResponse response = service.createExpenseBatch(request);

        assertNotNull(response.groupId());
        assertEquals(3, response.entries().size());
        assertEquals(response.groupId(), response.entries().get(0).groupId());
        assertEquals(response.groupId(), response.entries().get(1).groupId());
        assertEquals(response.groupId(), response.entries().get(2).groupId());
        assertEquals(LocalDate.of(2026, 4, 10), response.entries().get(0).dueDate());
        assertEquals(LocalDate.of(2026, 4, 24), response.entries().get(1).dueDate());
        assertEquals(LocalDate.of(2026, 5, 15), response.entries().get(2).dueDate());
        assertEquals(new BigDecimal("120.00"), response.entries().get(0).expectedAmount());
        assertEquals(new BigDecimal("130.00"), response.entries().get(1).expectedAmount());
        assertEquals(new BigDecimal("140.00"), response.entries().get(2).expectedAmount());
        assertEquals(PlannedEntryOriginType.BATCH_MANUAL, response.entries().get(0).originType());
        assertEquals("A23/01", response.entries().get(0).document());
        assertEquals("A23/02", response.entries().get(1).document());
        assertEquals("A23/03", response.entries().get(2).document());
        assertEquals(LocalDate.of(2026, 4, 1), response.entries().get(0).issueDate());
        verify(plannedEntryRepository).saveAll(any());
    }

    @Test
    void createIncomeBatchShouldGenerateIncomeEntriesWithSameGroup() {
        PlannedEntryBatchCreateRequest request = new PlannedEntryBatchCreateRequest(
                "Salario",
                2L,
                null,
                PlannedAmountBehavior.ESTIMATED,
                LocalDate.of(2026, 4, 17),
                "2026",
                null,
                null,
                List.of(
                        new PlannedEntryBatchItemRequest(2, LocalDate.of(2026, 6, 5), null, "2026/05", new BigDecimal("2750.00")),
                        new PlannedEntryBatchItemRequest(1, LocalDate.of(2026, 5, 5), null, "2026/04", new BigDecimal("2750.00"))
                )
        );
        Category incomeCategory = buildIncomeCategory(2L);

        when(categoryService.findByIdOrThrow(2L)).thenReturn(incomeCategory);
        when(plannedEntryRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(plannedEntryMapper.toResponse(any(PlannedEntry.class))).thenAnswer(invocation -> toResponse(invocation.getArgument(0)));

        PlannedEntryBatchCreateResponse response = service.createIncomeBatch(request);

        assertEquals(2, response.entries().size());
        assertEquals(FinancialDirection.INCOME, response.entries().get(0).direction());
        assertEquals(response.groupId(), response.entries().get(0).groupId());
        assertEquals(response.groupId(), response.entries().get(1).groupId());
        assertEquals("2026/04", response.entries().get(0).document());
        assertEquals("2026/05", response.entries().get(1).document());
    }

    @Test
    void createBatchShouldFailWhenCategoryDoesNotExist() {
        PlannedEntryBatchCreateRequest request = validBatchRequest();

        when(categoryService.findByIdOrThrow(1L)).thenThrow(new NotFoundException("Categoria não encontrada com ID: 1"));

        assertThrows(NotFoundException.class, () -> service.createExpenseBatch(request));
    }

    @Test
    void createBatchShouldFailWhenSubCategoryDoesNotExist() {
        PlannedEntryBatchCreateRequest request = new PlannedEntryBatchCreateRequest(
                "Academia",
                1L,
                43L,
                PlannedAmountBehavior.FIXED,
                LocalDate.of(2026, 4, 1),
                "A23",
                null,
                null,
                List.of(new PlannedEntryBatchItemRequest(1, LocalDate.of(2026, 4, 10), null, "A23/01", new BigDecimal("120.00")))
        );

        when(categoryService.findByIdOrThrow(1L)).thenReturn(buildExpenseCategory(1L));
        when(subCategoryService.findByIdOrThrow(43L)).thenThrow(new NotFoundException("SubCategoria não encontrada com ID: 43"));

        assertThrows(NotFoundException.class, () -> service.createExpenseBatch(request));
    }

    @Test
    void createBatchShouldFailWhenSubCategoryDoesNotBelongToCategory() {
        PlannedEntryBatchCreateRequest request = new PlannedEntryBatchCreateRequest(
                "Academia",
                1L,
                43L,
                PlannedAmountBehavior.FIXED,
                LocalDate.of(2026, 4, 1),
                "A23",
                null,
                null,
                List.of(new PlannedEntryBatchItemRequest(1, LocalDate.of(2026, 4, 10), null, "A23/01", new BigDecimal("120.00")))
        );
        Category category = buildExpenseCategory(1L);
        SubCategory subCategory = new SubCategory();
        subCategory.setId(43L);
        subCategory.setCategory(buildExpenseCategory(99L));

        when(categoryService.findByIdOrThrow(1L)).thenReturn(category);
        when(subCategoryService.findByIdOrThrow(43L)).thenReturn(subCategory);

        assertThrows(BusinessException.class, () -> service.createExpenseBatch(request));
    }

    @Test
    void createBatchShouldFailWhenDefaultAccountDoesNotExist() {
        PlannedEntryBatchCreateRequest request = new PlannedEntryBatchCreateRequest(
                "Academia",
                1L,
                null,
                PlannedAmountBehavior.FIXED,
                LocalDate.of(2026, 4, 1),
                "A23",
                15L,
                null,
                List.of(new PlannedEntryBatchItemRequest(1, LocalDate.of(2026, 4, 10), null, "A23/01", new BigDecimal("120.00")))
        );
        when(categoryService.findByIdOrThrow(1L)).thenReturn(buildExpenseCategory(1L));
        when(accountService.findByIdOrThrow(15L)).thenThrow(new NotFoundException("Conta não encontrada com ID: 15"));

        assertThrows(NotFoundException.class, () -> service.createExpenseBatch(request));
    }

    @Test
    void createBatchShouldFailWhenEntriesIsEmpty() {
        PlannedEntryBatchCreateRequest request = new PlannedEntryBatchCreateRequest(
                "Academia",
                1L,
                null,
                PlannedAmountBehavior.FIXED,
                LocalDate.of(2026, 4, 1),
                "A23",
                null,
                null,
                List.of()
        );

        assertThrows(BusinessException.class, () -> service.createExpenseBatch(request));
    }

    @Test
    void createBatchShouldFailWhenExpectedAmountIsNonPositive() {
        PlannedEntryBatchCreateRequest request = new PlannedEntryBatchCreateRequest(
                "Academia",
                1L,
                null,
                PlannedAmountBehavior.FIXED,
                LocalDate.of(2026, 4, 1),
                "A23",
                null,
                null,
                List.of(new PlannedEntryBatchItemRequest(1, LocalDate.of(2026, 4, 10), null, "A23/01", BigDecimal.ZERO))
        );

        assertThrows(BusinessException.class, () -> service.createExpenseBatch(request));
    }

    @Test
    void createBatchShouldFailWhenOrderIsDuplicated() {
        PlannedEntryBatchCreateRequest request = new PlannedEntryBatchCreateRequest(
                "Academia",
                1L,
                null,
                PlannedAmountBehavior.FIXED,
                LocalDate.of(2026, 4, 1),
                "A23",
                null,
                null,
                List.of(
                        new PlannedEntryBatchItemRequest(1, LocalDate.of(2026, 4, 10), null, "A23/01", new BigDecimal("120.00")),
                        new PlannedEntryBatchItemRequest(1, LocalDate.of(2026, 4, 24), null, "A23/02", new BigDecimal("130.00"))
                )
        );

        assertThrows(BusinessException.class, () -> service.createExpenseBatch(request));
    }

    @Test
    void createBatchShouldReturnAdjustedDueDateForPreview() {
        PlannedEntryBatchCreateRequest request = new PlannedEntryBatchCreateRequest(
                "Aluguel",
                1L,
                null,
                PlannedAmountBehavior.FIXED,
                null,
                null,
                null,
                null,
                List.of(new PlannedEntryBatchItemRequest(1, LocalDate.of(2026, 4, 18), null, null, new BigDecimal("900.00")))
        );
        Category category = buildExpenseCategory(1L);

        when(categoryService.findByIdOrThrow(1L)).thenReturn(category);
        when(businessDayService.adjustToNextBusinessDay(LocalDate.of(2026, 4, 18), 10L))
                .thenReturn(LocalDate.of(2026, 4, 20));
        when(plannedEntryRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(plannedEntryMapper.toResponse(any(PlannedEntry.class))).thenAnswer(invocation -> toResponse(invocation.getArgument(0)));

        PlannedEntryBatchCreateResponse response = service.createExpenseBatch(request);

        assertEquals(LocalDate.of(2026, 4, 20), response.entries().getFirst().dueDate());
    }

    @Test
    void createSingleExpenseShouldFallbackIssueDateToDueDateWhenMissing() {
        PlannedEntryCreateRequest request = new PlannedEntryCreateRequest(
                "Academia",
                1L,
                null,
                new BigDecimal("120.00"),
                PlannedAmountBehavior.FIXED,
                LocalDate.of(2026, 4, 10),
                null,
                null,
                null,
                null
        );
        Category category = buildExpenseCategory(1L);
        PlannedEntry mapped = new PlannedEntry();
        mapped.setExpectedAmount(request.expectedAmount());
        mapped.setAmountBehavior(request.amountBehavior());
        mapped.setDueDate(request.dueDate());

        when(plannedEntryMapper.toEntity(request)).thenReturn(mapped);
        when(categoryService.findByIdOrThrow(1L)).thenReturn(category);
        when(plannedEntryRepository.save(any(PlannedEntry.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(plannedEntryMapper.toResponse(any(PlannedEntry.class))).thenAnswer(invocation -> toResponse(invocation.getArgument(0)));

        PlannedEntryResponse response = service.createExpense(request);

        assertEquals(LocalDate.of(2026, 4, 10), response.issueDate());
    }

    @Test
    void listExpensesShouldReturnPagedResponse() {
        PlannedEntry entry = new PlannedEntry();
        entry.setId(1L);
        entry.setDirection(FinancialDirection.EXPENSE);
        entry.setStatus(PlannedEntryStatus.OPEN);
        entry.setDueDate(LocalDate.now().plusDays(1));
        entry.setDescription("Aluguel");
        entry.setExpectedAmount(new BigDecimal("1500.00"));
        entry.setAmountBehavior(PlannedAmountBehavior.FIXED);

        Page<PlannedEntry> page = new PageImpl<>(List.of(entry), PageRequest.of(0, 20), 1);
        when(plannedEntryRepository.findAll(any(org.springframework.data.jpa.domain.Specification.class), any(PageRequest.class)))
                .thenReturn(page);
        when(plannedEntryMapper.toResponse(any(PlannedEntry.class))).thenAnswer(invocation -> toResponse(invocation.getArgument(0)));

        PageResponse<PlannedEntryResponse> response = service.findExpenses(
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                PageRequest.of(0, 20)
        );

        assertEquals(1, response.content().size());
        assertEquals("Aluguel", response.content().getFirst().description());
    }

    @Test
    void listExpensesShouldRejectInvalidIssueDateRange() {
        assertThrows(BusinessException.class, () -> service.findExpenses(
                null,
                null,
                null,
                LocalDate.of(2026, 5, 1),
                LocalDate.of(2026, 4, 1),
                null,
                null,
                null,
                null,
                null,
                null,
                PageRequest.of(0, 20)
        ));
    }

    @Test
    void listExpensesShouldAcceptDocumentAndIssueDateFilters() {
        Page<PlannedEntry> page = new PageImpl<>(List.of(), PageRequest.of(0, 20), 0);
        when(plannedEntryRepository.findAll(any(org.springframework.data.jpa.domain.Specification.class), any(PageRequest.class)))
                .thenReturn(page);

        PageResponse<PlannedEntryResponse> response = service.findExpenses(
                null,
                null,
                LocalDate.of(2026, 4, 3),
                null,
                null,
                null,
                null,
                " DOC-100 ",
                null,
                null,
                null,
                PageRequest.of(0, 20)
        );

        assertEquals(0, response.totalElements());
        verify(plannedEntryRepository).findAll(any(org.springframework.data.jpa.domain.Specification.class), any(PageRequest.class));
    }

    @Test
    void updateIndividualShouldOnlyChangeCurrentEntry() {
        PlannedEntry entry = new PlannedEntry();
        entry.setId(11L);
        entry.setDirection(FinancialDirection.EXPENSE);
        entry.setStatus(PlannedEntryStatus.OPEN);
        entry.setDescription("Old");
        entry.setExpectedAmount(new BigDecimal("100.00"));
        entry.setAmountBehavior(PlannedAmountBehavior.FIXED);
        entry.setDueDate(LocalDate.now().plusDays(2));
        entry.setCategory(buildExpenseCategory(1L));

        when(plannedEntryRepository.findByIdAndWorkspaceIdAndDirection(11L, 10L, FinancialDirection.EXPENSE))
                .thenReturn(Optional.of(entry));
        when(plannedEntryRepository.save(any(PlannedEntry.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(plannedEntryMapper.toResponse(any(PlannedEntry.class))).thenAnswer(invocation -> toResponse(invocation.getArgument(0)));

        PlannedEntryUpdateRequest request = new PlannedEntryUpdateRequest(
                "Novo",
                null,
                null,
                new BigDecimal("200.00"),
                null,
                null,
                LocalDate.of(2026, 4, 2),
                "ABC-999",
                null,
                "nota"
        );

        PlannedEntryResponse response = service.updateExpense(11L, request);
        assertEquals("Novo", response.description());
        assertEquals(new BigDecimal("200.00"), response.expectedAmount());
        assertEquals("nota", response.notes());
        assertEquals("ABC-999", response.document());
        assertEquals(LocalDate.of(2026, 4, 2), response.issueDate());
    }

    @Test
    void updateFutureOpenShouldUpdateOnlyOpenEntries() {
        UUID groupId = UUID.randomUUID();
        PlannedEntry reference = new PlannedEntry();
        reference.setId(20L);
        reference.setDirection(FinancialDirection.EXPENSE);
        reference.setStatus(PlannedEntryStatus.OPEN);
        reference.setDueDate(LocalDate.of(2026, 4, 10));
        reference.setGroupId(groupId);
        reference.setCategory(buildExpenseCategory(1L));
        reference.setDescription("ref");
        reference.setExpectedAmount(new BigDecimal("100"));
        reference.setAmountBehavior(PlannedAmountBehavior.FIXED);

        PlannedEntry open1 = cloneForFuture(groupId, LocalDate.of(2026, 4, 10), PlannedEntryStatus.OPEN);
        PlannedEntry open2 = cloneForFuture(groupId, LocalDate.of(2026, 5, 10), PlannedEntryStatus.OPEN);

        when(plannedEntryRepository.findByIdAndWorkspaceIdAndDirection(20L, 10L, FinancialDirection.EXPENSE))
                .thenReturn(Optional.of(reference));
        when(plannedEntryRepository.findByWorkspaceIdAndDirectionAndGroupIdAndStatusAndDueDateGreaterThanEqualOrderByDueDateAsc(
                10L, FinancialDirection.EXPENSE, groupId, PlannedEntryStatus.OPEN, LocalDate.of(2026, 4, 10)
        )).thenReturn(List.of(open1, open2));
        when(plannedEntryRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));

        PlannedEntryFutureOpenUpdateRequest request = new PlannedEntryFutureOpenUpdateRequest(
                "novo desc",
                null,
                null,
                new BigDecimal("250.00"),
                LocalDate.of(2026, 4, 2),
                "REV-010",
                null,
                "novo note"
        );

        PlannedEntryFutureOpenUpdateResponse response = service.updateExpenseFutureOpen(20L, request);

        assertEquals(groupId, response.groupId());
        assertEquals(2, response.updatedCount());
        assertEquals("novo desc", open1.getDescription());
        assertEquals(new BigDecimal("250.00"), open2.getExpectedAmount());
        assertEquals("REV-010", open1.getDocument());
        assertEquals(LocalDate.of(2026, 4, 2), open2.getIssueDate());
    }

    @Test
    void updateFutureOpenShouldFailWhenEntryHasNoGroup() {
        PlannedEntry reference = new PlannedEntry();
        reference.setId(21L);
        reference.setDirection(FinancialDirection.EXPENSE);
        reference.setGroupId(null);
        reference.setDueDate(LocalDate.now());
        reference.setStatus(PlannedEntryStatus.OPEN);
        reference.setCategory(buildExpenseCategory(1L));

        when(plannedEntryRepository.findByIdAndWorkspaceIdAndDirection(21L, 10L, FinancialDirection.EXPENSE))
                .thenReturn(Optional.of(reference));

        PlannedEntryFutureOpenUpdateRequest request = new PlannedEntryFutureOpenUpdateRequest(
                null, null, null, new BigDecimal("80.00"), null, null, null, null
        );

        assertThrows(BusinessException.class, () -> service.updateExpenseFutureOpen(21L, request));
    }

    @Test
    void updateFutureOpenShouldIgnoreNonOpenByDesign() {
        UUID groupId = UUID.randomUUID();
        PlannedEntry reference = cloneForFuture(groupId, LocalDate.of(2026, 4, 10), PlannedEntryStatus.OPEN);
        reference.setId(22L);
        reference.setCategory(buildExpenseCategory(1L));

        when(plannedEntryRepository.findByIdAndWorkspaceIdAndDirection(22L, 10L, FinancialDirection.EXPENSE))
                .thenReturn(Optional.of(reference));
        when(plannedEntryRepository.findByWorkspaceIdAndDirectionAndGroupIdAndStatusAndDueDateGreaterThanEqualOrderByDueDateAsc(
                10L, FinancialDirection.EXPENSE, groupId, PlannedEntryStatus.OPEN, LocalDate.of(2026, 4, 10)
        )).thenReturn(List.of());
        when(plannedEntryRepository.saveAll(any())).thenReturn(List.of());

        PlannedEntryFutureOpenUpdateResponse response = service.updateExpenseFutureOpen(
                22L,
                new PlannedEntryFutureOpenUpdateRequest("x", null, null, null, null, null, null, null)
        );

        assertEquals(0, response.updatedCount());
    }

    private static Category buildExpenseCategory(Long id) {
        Category category = new Category();
        category.setId(id);
        category.setMovementType(MovementType.EXPENSE);
        category.setName("Despesas");
        return category;
    }

    private static Category buildIncomeCategory(Long id) {
        Category category = new Category();
        category.setId(id);
        category.setMovementType(MovementType.INCOME);
        category.setName("Receitas");
        return category;
    }

    private static PlannedEntryBatchCreateRequest validBatchRequest() {
        return new PlannedEntryBatchCreateRequest(
                "Academia",
                1L,
                null,
                PlannedAmountBehavior.FIXED,
                LocalDate.of(2026, 4, 1),
                "A23",
                null,
                null,
                List.of(new PlannedEntryBatchItemRequest(1, LocalDate.of(2026, 4, 10), null, "A23/01", new BigDecimal("120.00")))
        );
    }

    private static PlannedEntry cloneForFuture(UUID groupId, LocalDate dueDate, PlannedEntryStatus status) {
        PlannedEntry entry = new PlannedEntry();
        entry.setGroupId(groupId);
        entry.setDirection(FinancialDirection.EXPENSE);
        entry.setStatus(status);
        entry.setDueDate(dueDate);
        entry.setDescription("desc");
        entry.setExpectedAmount(new BigDecimal("100"));
        entry.setAmountBehavior(PlannedAmountBehavior.FIXED);
        return entry;
    }

    private static PlannedEntryResponse toResponse(PlannedEntry entry) {
        return new PlannedEntryResponse(
                entry.getId(),
                entry.getDirection(),
                entry.getDescription(),
                entry.getCategory() != null ? entry.getCategory().getId() : null,
                entry.getSubCategory() != null ? entry.getSubCategory().getId() : null,
                entry.getExpectedAmount(),
                entry.getActualAmount(),
                entry.getAmountBehavior(),
                entry.getDueDate(),
                entry.getIssueDate(),
                entry.getDocument(),
                entry.getStatus(),
                entry.getDefaultAccount() != null ? entry.getDefaultAccount().getId() : null,
                entry.getSettledAccount() != null ? entry.getSettledAccount().getId() : null,
                entry.getSettledAt(),
                entry.getMovement() != null ? entry.getMovement().getId() : null,
                entry.getGroupId(),
                entry.getOriginType(),
                entry.getNotes(),
                new BaseResponse(null, null, true)
        );
    }
}
