package com.meufluxo.service;

import com.meufluxo.common.exception.BusinessException;
import com.meufluxo.common.exception.NotFoundException;
import com.meufluxo.dto.cashMovement.CashMovementResponse;
import com.meufluxo.dto.creditCardInvoicePayment.CreditCardInvoicePaymentRequest;
import com.meufluxo.dto.creditCardInvoicePayment.CreditCardInvoicePaymentResponse;
import com.meufluxo.enums.CreditCardInvoiceStatus;
import com.meufluxo.enums.MovementType;
import com.meufluxo.enums.PaymentMethod;
import com.meufluxo.mapper.CreditCardInvoicePaymentMapper;
import com.meufluxo.model.Account;
import com.meufluxo.model.CashMovement;
import com.meufluxo.model.Category;
import com.meufluxo.model.CreditCard;
import com.meufluxo.model.CreditCardInvoice;
import com.meufluxo.model.CreditCardInvoicePayment;
import com.meufluxo.model.SubCategory;
import com.meufluxo.model.workspaceAndUsers.Workspace;
import com.meufluxo.repository.CategoryRepository;
import com.meufluxo.repository.CreditCardInvoicePaymentRepository;
import com.meufluxo.repository.SubCategoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CreditCardInvoicePaymentServiceTest {

    @Mock
    private CurrentUserService currentUserService;
    @Mock
    private CreditCardInvoicePaymentRepository paymentRepository;
    @Mock
    private CreditCardInvoicePaymentMapper paymentMapper;
    @Mock
    private CreditCardInvoiceService invoiceService;
    @Mock
    private AccountService accountService;
    @Mock
    private CashMovementService cashMovementService;
    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private SubCategoryRepository subCategoryRepository;
    @Mock
    private WorkspaceSyncStateService workspaceSyncStateService;

    private CreditCardInvoicePaymentService service;

    @BeforeEach
    void setUp() {
        service = new CreditCardInvoicePaymentService(
                currentUserService,
                paymentRepository,
                paymentMapper,
                invoiceService,
                accountService,
                cashMovementService,
                categoryRepository,
                subCategoryRepository,
                workspaceSyncStateService
        );
        Workspace workspace = new Workspace();
        workspace.setId(10L);
        lenient().when(currentUserService.getCurrentWorkspaceId()).thenReturn(10L);
        lenient().when(currentUserService.getCurrentWorkspace()).thenReturn(workspace);
    }

    @Test
    void createShouldGenerateCashMovementAndLinkPaymentToMovement() {
        CreditCardInvoice invoice = buildInvoice(11L, new BigDecimal("500.00"), CreditCardInvoiceStatus.OPEN, 4, 2026);
        Account account = buildAccount(22L, "Conta Principal");
        Category category = buildCategory(30L, "Pagamento de fatura de cartao");
        SubCategory subCategory = buildSubCategory(31L, category, "Geral");
        CashMovement movement = new CashMovement();
        movement.setId(900L);

        when(invoiceService.findByIdOrThrow(11L)).thenReturn(invoice);
        when(accountService.findByIdOrThrow(22L)).thenReturn(account);
        when(categoryRepository.findByNameIgnoreCaseAndWorkspaceId("Pagamento de fatura de cartao", 10L)).thenReturn(Optional.of(category));
        when(subCategoryRepository.findByNameIgnoreCaseAndCategoryIdAndWorkspaceId("Geral", 30L, 10L)).thenReturn(Optional.of(subCategory));
        when(cashMovementService.create(any())).thenReturn(new CashMovementResponse(
                900L,
                "Pagamento fatura 04/2026",
                PaymentMethod.INVOICE_CREDIT_CARD,
                new BigDecimal("200.00"),
                LocalDate.of(2026, 4, 26),
                null,
                MovementType.EXPENSE,
                null,
                null,
                null
        ));
        when(cashMovementService.findByIdOrThrow(900L)).thenReturn(movement);
        when(paymentRepository.save(any(CreditCardInvoicePayment.class))).thenAnswer(invocation -> {
            CreditCardInvoicePayment p = invocation.getArgument(0);
            p.setId(501L);
            return p;
        });
        when(paymentMapper.toResponse(any(CreditCardInvoicePayment.class))).thenAnswer(invocation -> {
            CreditCardInvoicePayment p = invocation.getArgument(0);
            return new CreditCardInvoicePaymentResponse(
                    p.getId(),
                    p.getInvoice().getId(),
                    "04/2026",
                    p.getAccount().getId(),
                    p.getAccount().getName(),
                    p.getPaymentDate(),
                    p.getAmount(),
                    p.getNotes(),
                    p.getMovement() != null ? p.getMovement().getId() : null,
                    p.isActive(),
                    p.getCreatedAt(),
                    p.getUpdatedAt()
            );
        });
        doNothing().when(workspaceSyncStateService).incrementCreditCardsVersion(10L);

        CreditCardInvoicePaymentRequest request = new CreditCardInvoicePaymentRequest(
                11L,
                22L,
                LocalDate.of(2026, 4, 26),
                new BigDecimal("200.00"),
                "Pagamento parcial"
        );

        CreditCardInvoicePaymentResponse response = service.create(request);

        ArgumentCaptor<com.meufluxo.dto.cashMovement.CashMovementRequest> movementCaptor =
                ArgumentCaptor.forClass(com.meufluxo.dto.cashMovement.CashMovementRequest.class);
        verify(cashMovementService).create(movementCaptor.capture());
        assertEquals(MovementType.EXPENSE, movementCaptor.getValue().movementType());
        assertEquals(PaymentMethod.INVOICE_CREDIT_CARD, movementCaptor.getValue().paymentMethod());
        assertEquals(new BigDecimal("200.00"), movementCaptor.getValue().amount());
        assertEquals(22L, movementCaptor.getValue().accountId());

        assertNotNull(response);
        assertEquals(900L, response.movementId());
        verify(invoiceService).recalculateInvoiceTotals(11L);
        verify(workspaceSyncStateService).incrementCreditCardsVersion(10L);
    }

    @Test
    void createShouldRejectOverpayment() {
        CreditCardInvoice invoice = buildInvoice(11L, new BigDecimal("100.00"), CreditCardInvoiceStatus.OPEN, 4, 2026);
        Account account = buildAccount(22L, "Conta Principal");
        when(invoiceService.findByIdOrThrow(11L)).thenReturn(invoice);
        when(accountService.findByIdOrThrow(22L)).thenReturn(account);

        CreditCardInvoicePaymentRequest request = new CreditCardInvoicePaymentRequest(
                11L,
                22L,
                LocalDate.of(2026, 4, 26),
                new BigDecimal("150.00"),
                null
        );

        assertThrows(BusinessException.class, () -> service.create(request));
        verify(cashMovementService, never()).create(any());
        verify(paymentRepository, never()).save(any());
    }

    @Test
    void deleteShouldRemovePaymentDeleteMovementAndRecalculateInvoice() {
        CreditCardInvoice invoice = buildInvoice(11L, new BigDecimal("300.00"), CreditCardInvoiceStatus.PARTIALLY_PAID, 4, 2026);
        CreditCardInvoicePayment payment = new CreditCardInvoicePayment();
        payment.setId(501L);
        payment.setInvoice(invoice);
        CashMovement movement = new CashMovement();
        movement.setId(900L);
        payment.setMovement(movement);

        when(paymentRepository.findByIdAndWorkspaceId(501L, 10L)).thenReturn(Optional.of(payment));
        doNothing().when(cashMovementService).delete(900L);
        doNothing().when(workspaceSyncStateService).incrementCreditCardsVersion(10L);

        service.delete(501L);

        InOrder inOrder = inOrder(paymentRepository, cashMovementService, invoiceService, workspaceSyncStateService);
        inOrder.verify(paymentRepository).delete(payment);
        inOrder.verify(paymentRepository).flush();
        inOrder.verify(cashMovementService).delete(900L);
        inOrder.verify(invoiceService).recalculateInvoiceTotals(11L);
        inOrder.verify(workspaceSyncStateService).incrementCreditCardsVersion(10L);
    }

    @Test
    void deleteShouldNotCallCashMovementDeleteWhenPaymentHasNoMovement() {
        CreditCardInvoice invoice = buildInvoice(11L, new BigDecimal("300.00"), CreditCardInvoiceStatus.PARTIALLY_PAID, 4, 2026);
        CreditCardInvoicePayment payment = new CreditCardInvoicePayment();
        payment.setId(777L);
        payment.setInvoice(invoice);
        payment.setMovement(null);

        when(paymentRepository.findByIdAndWorkspaceId(777L, 10L)).thenReturn(Optional.of(payment));

        service.delete(777L);

        verify(paymentRepository).delete(payment);
        verify(paymentRepository).flush();
        verify(cashMovementService, never()).delete(any());
        verify(invoiceService).recalculateInvoiceTotals(11L);
        verify(workspaceSyncStateService).incrementCreditCardsVersion(10L);
    }

    @Test
    void deleteShouldFailWhenPaymentIsFromAnotherWorkspaceOrNotFound() {
        when(paymentRepository.findByIdAndWorkspaceId(eq(999L), eq(10L))).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> service.delete(999L));
        verify(paymentRepository, never()).delete(any(CreditCardInvoicePayment.class));
        verify(cashMovementService, never()).delete(any());
        verify(invoiceService, never()).recalculateInvoiceTotals(any());
    }

    private CreditCardInvoice buildInvoice(
            Long id,
            BigDecimal remainingAmount,
            CreditCardInvoiceStatus status,
            Integer referenceMonth,
            Integer referenceYear
    ) {
        CreditCard creditCard = new CreditCard();
        creditCard.setId(1L);
        creditCard.setName("Cartao");
        creditCard.setClosingDay(10);
        creditCard.setDueDay(21);

        CreditCardInvoice invoice = new CreditCardInvoice();
        invoice.setId(id);
        invoice.setCreditCard(creditCard);
        invoice.setReferenceMonth(referenceMonth);
        invoice.setReferenceYear(referenceYear);
        invoice.setRemainingAmount(remainingAmount);
        invoice.setStatus(status);
        return invoice;
    }

    private Account buildAccount(Long id, String name) {
        Account account = new Account();
        account.setId(id);
        account.setName(name);
        return account;
    }

    private Category buildCategory(Long id, String name) {
        Category category = new Category();
        category.setId(id);
        category.setName(name);
        category.setMovementType(MovementType.EXPENSE);
        return category;
    }

    private SubCategory buildSubCategory(Long id, Category category, String name) {
        SubCategory subCategory = new SubCategory();
        subCategory.setId(id);
        subCategory.setCategory(category);
        subCategory.setName(name);
        return subCategory;
    }
}
