package com.meufluxo.kpi.dto;

import com.meufluxo.cashmovement.model.MovementType;

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
