package com.meufluxo.creditcard.dto;

import com.meufluxo.creditcard.model.CreditCardExpenseStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CreditCardInvoiceDetailsExpenseItemResponse(
        Long id,
        String description,
        LocalDate purchaseDate,
        Long categoryId,
        String categoryName,
        Long subcategoryId,
        String subcategoryName,
        BigDecimal amount,
        Integer installmentNumber,
        Integer installmentCount,
        UUID installmentGroupId,
        CreditCardExpenseStatus status,
        String statusLabel
) {
}
