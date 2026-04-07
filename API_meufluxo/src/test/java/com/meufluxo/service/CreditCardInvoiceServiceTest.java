package com.meufluxo.service;

import com.meufluxo.enums.BrandCard;
import com.meufluxo.enums.CreditCardInvoiceStatus;
import com.meufluxo.mapper.CreditCardInvoiceMapper;
import com.meufluxo.model.CreditCard;
import com.meufluxo.model.CreditCardInvoice;
import com.meufluxo.model.workspaceAndUsers.Workspace;
import com.meufluxo.repository.CreditCardExpenseRepository;
import com.meufluxo.repository.CreditCardInvoicePaymentRepository;
import com.meufluxo.repository.CreditCardInvoiceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CreditCardInvoiceServiceTest {

    @Mock
    private CurrentUserService currentUserService;
    @Mock
    private CreditCardInvoiceRepository invoiceRepository;
    @Mock
    private CreditCardInvoicePaymentRepository paymentRepository;
    @Mock
    private CreditCardExpenseRepository expenseRepository;
    @Mock
    private CreditCardInvoiceCalculationService calculationService;
    @Mock
    private CreditCardInvoiceMapper invoiceMapper;
    @Mock
    private CreditCardService creditCardService;

    private CreditCardInvoiceService service;

    @BeforeEach
    void setUp() {
        service = new CreditCardInvoiceService(
                currentUserService,
                invoiceRepository,
                paymentRepository,
                expenseRepository,
                calculationService,
                invoiceMapper,
                creditCardService
        );
        lenient().when(currentUserService.getCurrentWorkspaceId()).thenReturn(10L);
        Workspace workspace = new Workspace();
        workspace.setId(10L);
        lenient().when(currentUserService.getCurrentWorkspace()).thenReturn(workspace);
    }

    @Test
    void recalculateShouldSetPartiallyPaidWhenThereIsPaymentAndRemainingBalance() {
        CreditCardInvoice invoice = buildInvoice(1L, LocalDate.now().plusDays(5));
        when(invoiceRepository.findByIdAndCreditCardWorkspaceId(1L, 10L)).thenReturn(Optional.of(invoice));
        when(invoiceRepository.sumOpenExpensesByInvoiceId(1L)).thenReturn(new BigDecimal("300.00"));
        when(paymentRepository.sumActivePaymentsByInvoiceId(1L)).thenReturn(new BigDecimal("100.00"));
        when(invoiceRepository.save(any(CreditCardInvoice.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CreditCardInvoice saved = service.recalculateInvoiceTotals(1L);

        assertEquals(new BigDecimal("350.00"), saved.getTotalAmount());
        assertEquals(new BigDecimal("100.00"), saved.getPaidAmount());
        assertEquals(new BigDecimal("250.00"), saved.getRemainingAmount());
        assertEquals(CreditCardInvoiceStatus.PARTIALLY_PAID, saved.getStatus());
    }

    @Test
    void findOrCreateShouldCarryPreviousRemainingBalance() {
        CreditCard card = new CreditCard();
        card.setId(7L);
        card.setName("Nubank");
        card.setBrand(BrandCard.MASTERCARD);
        card.setClosingDay(10);
        card.setDueDay(21);

        CreditCardInvoiceCalculationService.InvoiceCalculationResult calc =
                new CreditCardInvoiceCalculationService.InvoiceCalculationResult(
                        2026, 5,
                        LocalDate.of(2026, 4, 11),
                        LocalDate.of(2026, 5, 10),
                        LocalDate.of(2026, 5, 10),
                        LocalDate.of(2026, 5, 21)
                );

        CreditCardInvoice previous = buildInvoice(99L, LocalDate.of(2026, 4, 21));
        previous.setReferenceYear(2026);
        previous.setReferenceMonth(4);
        previous.setRemainingAmount(new BigDecimal("123.45"));

        when(calculationService.calculate(card, LocalDate.of(2026, 4, 11))).thenReturn(calc);
        when(invoiceRepository.findByCreditCardIdAndReferenceYearAndReferenceMonthAndCreditCardWorkspaceId(7L, 2026, 5, 10L))
                .thenReturn(Optional.empty());
        when(invoiceRepository.findByCreditCardIdAndReferenceYearAndReferenceMonthAndCreditCardWorkspaceId(7L, 2026, 4, 10L))
                .thenReturn(Optional.of(previous));
        when(invoiceRepository.save(any(CreditCardInvoice.class))).thenAnswer(invocation -> {
            CreditCardInvoice i = invocation.getArgument(0);
            i.setId(100L);
            return i;
        });
        CreditCardInvoice created = service.findOrCreateForPurchaseDate(card, LocalDate.of(2026, 4, 11));

        assertNotNull(created.getId());
        assertEquals(new BigDecimal("123.45"), created.getPreviousBalance());
        assertEquals(new BigDecimal("123.45"), created.getTotalAmount());
        assertEquals(new BigDecimal("123.45"), created.getRemainingAmount());
        assertEquals(CreditCardInvoiceStatus.OPEN, created.getStatus());
    }

    private CreditCardInvoice buildInvoice(Long id, LocalDate dueDate) {
        CreditCard card = new CreditCard();
        card.setId(1L);
        card.setName("Cartao");
        card.setBrand(BrandCard.VISA);
        card.setClosingDay(10);
        card.setDueDay(21);

        CreditCardInvoice invoice = new CreditCardInvoice();
        invoice.setId(id);
        invoice.setCreditCard(card);
        invoice.setReferenceYear(dueDate.getYear());
        invoice.setReferenceMonth(dueDate.getMonthValue());
        invoice.setDueDate(dueDate);
        invoice.setClosingDate(dueDate.minusDays(11));
        invoice.setPurchasesAmount(BigDecimal.ZERO);
        invoice.setPreviousBalance(new BigDecimal("50.00"));
        invoice.setRevolvingInterest(BigDecimal.ZERO);
        invoice.setLateFee(BigDecimal.ZERO);
        invoice.setOtherCharges(BigDecimal.ZERO);
        invoice.setPaidAmount(BigDecimal.ZERO);
        invoice.setTotalAmount(new BigDecimal("50.00"));
        invoice.setRemainingAmount(new BigDecimal("50.00"));
        invoice.setStatus(CreditCardInvoiceStatus.OPEN);
        return invoice;
    }
}
