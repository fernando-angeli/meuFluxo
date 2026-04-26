package com.meufluxo.service;

import com.meufluxo.common.exception.BusinessException;
import com.meufluxo.dto.creditCardExpense.CreditCardExpenseCreateResponse;
import com.meufluxo.dto.creditCardExpense.CreditCardExpenseRequest;
import com.meufluxo.dto.creditCardExpense.CreditCardExpenseResponse;
import com.meufluxo.enums.BrandCard;
import com.meufluxo.mapper.CreditCardExpenseMapper;
import com.meufluxo.model.Category;
import com.meufluxo.model.CreditCard;
import com.meufluxo.model.CreditCardExpense;
import com.meufluxo.model.CreditCardInvoice;
import com.meufluxo.model.SubCategory;
import com.meufluxo.model.workspaceAndUsers.Workspace;
import com.meufluxo.repository.CreditCardExpenseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CreditCardExpenseServiceTest {

    @Mock
    private CurrentUserService currentUserService;
    @Mock
    private CreditCardExpenseRepository creditCardExpenseRepository;
    @Mock
    private CreditCardExpenseMapper creditCardExpenseMapper;
    @Mock
    private CreditCardService creditCardService;
    @Mock
    private CreditCardInvoiceService creditCardInvoiceService;
    @Mock
    private CategoryService categoryService;
    @Mock
    private SubCategoryService subCategoryService;
    @Mock
    private WorkspaceSyncStateService workspaceSyncStateService;

    private CreditCardExpenseService service;

    @BeforeEach
    void setUp() {
        service = new CreditCardExpenseService(
                currentUserService,
                creditCardExpenseRepository,
                creditCardExpenseMapper,
                creditCardService,
                creditCardInvoiceService,
                categoryService,
                subCategoryService,
                workspaceSyncStateService
        );
        Workspace workspace = new Workspace();
        workspace.setId(10L);
        lenient().when(currentUserService.getCurrentWorkspace()).thenReturn(workspace);
        lenient().when(currentUserService.getCurrentWorkspaceId()).thenReturn(10L);
    }

    @Test
    void createShouldSplitInstallmentsAndAdjustLastRounding() {
        CreditCard card = new CreditCard();
        card.setId(1L);
        card.setName("Nubank");
        card.setBrand(BrandCard.MASTERCARD);

        Category category = new Category();
        category.setId(2L);
        category.setName("Eletronicos");

        SubCategory subCategory = new SubCategory();
        subCategory.setId(3L);
        subCategory.setName("Notebook");
        subCategory.setCategory(category);

        CreditCardInvoice invoice = new CreditCardInvoice();
        invoice.setId(11L);

        when(creditCardService.findByIdOrThrow(1L)).thenReturn(card);
        when(categoryService.findByIdOrThrow(2L)).thenReturn(category);
        when(subCategoryService.findByIdOrThrow(3L)).thenReturn(subCategory);
        when(creditCardInvoiceService.findOrCreateForPurchaseDate(any(CreditCard.class), any(LocalDate.class))).thenReturn(invoice);

        AtomicLong seq = new AtomicLong(100);
        when(creditCardExpenseRepository.save(any(CreditCardExpense.class))).thenAnswer(invocation -> {
            CreditCardExpense e = invocation.getArgument(0);
            e.setId(seq.incrementAndGet());
            e.setCreatedAt(LocalDateTime.now());
            e.setUpdatedAt(LocalDateTime.now());
            return e;
        });
        when(creditCardExpenseMapper.toResponse(any(CreditCardExpense.class))).thenAnswer(invocation -> {
            CreditCardExpense e = invocation.getArgument(0);
            return new CreditCardExpenseResponse(
                    e.getId(),
                    1L,
                    "Nubank",
                    BrandCard.MASTERCARD,
                    11L,
                    "04/2026",
                    e.getDescription(),
                    e.getPurchaseDate(),
                    2L,
                    "Eletronicos",
                    3L,
                    "Notebook",
                    e.getAmount(),
                    e.getInstallmentNumber(),
                    e.getInstallmentCount(),
                    e.getInstallmentGroupId(),
                    e.getStatus(),
                    "Em aberto",
                    e.getNotes(),
                    e.getCreatedAt(),
                    e.getUpdatedAt()
            );
        });

        CreditCardExpenseCreateResponse response = service.create(new CreditCardExpenseRequest(
                1L,
                "Notebook gamer",
                LocalDate.of(2026, 4, 5),
                2L,
                3L,
                new BigDecimal("100.00"),
                3,
                "Parcelado"
        ));

        assertEquals(3, response.expenses().size());
        assertEquals(new BigDecimal("33.33"), response.expenses().get(0).amount());
        assertEquals(new BigDecimal("33.33"), response.expenses().get(1).amount());
        assertEquals(new BigDecimal("33.34"), response.expenses().get(2).amount());
        assertEquals(1, response.expenses().get(0).installmentNumber());
        assertEquals(3, response.expenses().get(2).installmentNumber());
        UUID group = response.installmentGroupId();
        assertEquals(group, response.expenses().get(0).installmentGroupId());
        assertEquals(group, response.expenses().get(2).installmentGroupId());
    }

    @Test
    void cancelShouldBlockWhenInvoiceIsNotOpen() {
        CreditCardExpense expense = new CreditCardExpense();
        expense.setId(20L);
        expense.setInvoice(new CreditCardInvoice());
        when(creditCardExpenseRepository.findByIdAndWorkspaceId(20L, 10L)).thenReturn(Optional.of(expense));
        doThrow(new BusinessException("A operação só é permitida para lançamentos em faturas com status OPEN."))
                .when(creditCardInvoiceService).assertInvoiceAllowsExpenseChanges(any(CreditCardInvoice.class));

        assertThrows(BusinessException.class, () -> service.cancel(20L));
    }
}
