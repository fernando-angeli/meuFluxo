package com.meufluxo.dto.creditCard;

import com.meufluxo.enums.BrandCard;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CreditCardResponse(
        Long id,
        String name,
        String cardDisplayName,
        BrandCard brand,
        Integer closingDay,
        Integer dueDay,
        BigDecimal creditLimit,
        Long defaultPaymentAccountId,
        String defaultPaymentAccountName,
        String notes,
        boolean active,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
