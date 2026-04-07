package com.meufluxo.dto.creditCardInvoice;

import com.meufluxo.enums.CreditCardInvoiceStatus;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreditCardInvoiceResponse(
        Long id,
        Long creditCardId,
        String creditCardName,
        String cardDisplayName,
        Integer referenceYear,
        Integer referenceMonth,
        String referenceLabel,
        LocalDate periodStart,
        LocalDate periodEnd,
        LocalDate closingDate,
        LocalDate dueDate,
        BigDecimal purchasesAmount,
        BigDecimal previousBalance,
        BigDecimal revolvingInterest,
        BigDecimal lateFee,
        BigDecimal otherCharges,
        BigDecimal paidAmount,
        BigDecimal totalAmount,
        BigDecimal remainingAmount,
        CreditCardInvoiceStatus status,
        String statusLabel,
        boolean active
) {
}
