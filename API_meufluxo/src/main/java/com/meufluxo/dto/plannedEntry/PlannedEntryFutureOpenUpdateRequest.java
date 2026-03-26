package com.meufluxo.dto.plannedEntry;

import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record PlannedEntryFutureOpenUpdateRequest(
        @Size(max = 255, message = "Descrição deve ter no máximo 255 caracteres.")
        String description,

        Long categoryId,

        Long subCategoryId,

        @Positive(message = "Valor esperado deve ser maior que zero.")
        BigDecimal expectedAmount,

        Long defaultAccountId,

        @Size(max = 2000, message = "Notas devem ter no máximo 2000 caracteres.")
        String notes
) {
}
