package com.meufluxo.dto.kpi;

import com.meufluxo.enums.MovementType;

import java.math.BigDecimal;

public record InvoicePaymentAllocationLineResponse(
        long expenseId,
        long categoryId,
        String categoryName,
        MovementType categoryMovementType,
        Long subCategoryId,
        String subCategoryName,
        String description,
        BigDecimal allocatedAmount
) {
}
