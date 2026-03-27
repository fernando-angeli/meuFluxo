package com.meufluxo.dto.plannedEntry;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PlannedEntryBatchItemRequest(
        @NotNull(message = "Data de vencimento é obrigatória.")
        LocalDate dueDate,

        @NotNull(message = "Valor esperado é obrigatório.")
        @Positive(message = "Valor esperado deve ser maior que zero.")
        BigDecimal expectedAmount
) {
}
