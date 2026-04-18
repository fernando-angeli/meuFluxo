package com.meufluxo.dto.plannedEntry;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PlannedEntryBatchItemRequest(
        @NotNull(message = "Ordem é obrigatória.")
        @Positive(message = "Ordem deve ser maior que zero.")
        Integer order,

        @NotNull(message = "Data de vencimento é obrigatória.")
        LocalDate dueDate,

        @JsonAlias({"emissionDate", "expenseDate"})
        LocalDate issueDate,

        @JsonAlias("documento")
        @Size(max = 255, message = "Documento deve ter no máximo 255 caracteres.")
        String document,

        @NotNull(message = "Valor esperado é obrigatório.")
        @Positive(message = "Valor esperado deve ser maior que zero.")
        BigDecimal expectedAmount
) {
}
