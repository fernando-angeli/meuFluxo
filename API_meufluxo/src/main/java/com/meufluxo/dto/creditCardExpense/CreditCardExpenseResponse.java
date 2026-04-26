package com.meufluxo.dto.creditCardExpense;

import com.meufluxo.enums.CreditCardExpenseStatus;
import com.meufluxo.enums.BrandCard;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record CreditCardExpenseResponse(
        Long id,
        Long creditCardId,
        String creditCardName,
        BrandCard creditCardBrand,
        Long invoiceId,
        String invoiceReference,
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
        String statusLabel,
        String notes,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
