package com.meufluxo.creditcard.dto;

import com.meufluxo.creditcard.model.CreditCardInvoiceStatus;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreditCardInvoiceListResponse(
        Long id,
        Long creditCardId,
        String creditCardName,
        String cardDisplayName,
        String referenceLabel,
        LocalDate dueDate,
        BigDecimal purchasesAmount,
        BigDecimal previousBalance,
        BigDecimal totalAmount,
        BigDecimal paidAmount,
        BigDecimal remainingAmount,
        CreditCardInvoiceStatus status,
        String statusLabel
) {
}
