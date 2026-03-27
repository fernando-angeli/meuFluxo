package com.meufluxo.dto.plannedEntry;

import com.meufluxo.dto.BaseResponse;
import com.meufluxo.enums.FinancialDirection;
import com.meufluxo.enums.PlannedAmountBehavior;
import com.meufluxo.enums.PlannedEntryOriginType;
import com.meufluxo.enums.PlannedEntryStatus;

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
