package com.meufluxo.planning.dto;

import com.meufluxo.shared.dto.BaseResponse;
import com.meufluxo.cashmovement.model.FinancialDirection;
import com.meufluxo.planning.model.PlannedAmountBehavior;
import com.meufluxo.planning.model.PlannedEntryOriginType;
import com.meufluxo.planning.model.PlannedEntryStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record PlannedEntryResponse(
        Long id,
        FinancialDirection direction,
        String description,
        Long categoryId,
        Long subCategoryId,
        BigDecimal expectedAmount,
        BigDecimal actualAmount,
        PlannedAmountBehavior amountBehavior,
        LocalDate dueDate,
        LocalDate issueDate,
        String document,
        PlannedEntryStatus status,
        Long defaultAccountId,
        Long settledAccountId,
        LocalDateTime settledAt,
        Long movementId,
        UUID groupId,
        PlannedEntryOriginType originType,
        String notes,
        BaseResponse meta
) {
}
