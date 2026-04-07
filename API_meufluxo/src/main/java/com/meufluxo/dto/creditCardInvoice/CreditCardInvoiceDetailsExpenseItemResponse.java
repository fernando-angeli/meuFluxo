package com.meufluxo.dto.creditCardInvoice;

import com.meufluxo.enums.CreditCardExpenseStatus;

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
