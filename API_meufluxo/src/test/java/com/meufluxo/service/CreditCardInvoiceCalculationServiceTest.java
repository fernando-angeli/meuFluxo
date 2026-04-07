package com.meufluxo.service;

import com.meufluxo.enums.BrandCard;
import com.meufluxo.model.CreditCard;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;

class CreditCardInvoiceCalculationServiceTest {

    private final CreditCardInvoiceCalculationService service = new CreditCardInvoiceCalculationService();

    @Test
    void shouldKeepPurchaseBeforeClosingInSameDueMonth() {
        CreditCard card = buildCard(10, 21);

        CreditCardInvoiceCalculationService.InvoiceCalculationResult result = service.calculate(
                card,
                LocalDate.of(2026, 4, 5)
        );

        assertEquals(2026, result.referenceYear());
        assertEquals(4, result.referenceMonth());
        assertEquals(LocalDate.of(2026, 4, 10), result.closingDate());
        assertEquals(LocalDate.of(2026, 4, 21), result.dueDate());
        assertEquals(LocalDate.of(2026, 3, 11), result.periodStart());
        assertEquals(LocalDate.of(2026, 4, 10), result.periodEnd());
    }

    @Test
    void shouldMovePurchaseAfterClosingToNextDueMonth() {
        CreditCard card = buildCard(10, 21);

        CreditCardInvoiceCalculationService.InvoiceCalculationResult result = service.calculate(
                card,
                LocalDate.of(2026, 4, 11)
        );

        assertEquals(2026, result.referenceYear());
        assertEquals(5, result.referenceMonth());
        assertEquals(LocalDate.of(2026, 5, 10), result.closingDate());
        assertEquals(LocalDate.of(2026, 5, 21), result.dueDate());
        assertEquals(LocalDate.of(2026, 4, 11), result.periodStart());
        assertEquals(LocalDate.of(2026, 5, 10), result.periodEnd());
    }

    private CreditCard buildCard(int closingDay, int dueDay) {
        CreditCard card = new CreditCard();
        card.setName("Cartao Teste");
        card.setBrand(BrandCard.VISA);
        card.setClosingDay(closingDay);
        card.setDueDay(dueDay);
        return card;
    }
}
