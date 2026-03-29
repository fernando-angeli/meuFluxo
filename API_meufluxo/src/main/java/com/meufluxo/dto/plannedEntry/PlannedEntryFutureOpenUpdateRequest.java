package com.meufluxo.dto.plannedEntry;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PlannedEntryFutureOpenUpdateRequest(
        @Size(max = 255, message = "Descrição deve ter no máximo 255 caracteres.")
        String description,

        Long categoryId,

        Long subCategoryId,

        @Positive(message = "Valor esperado deve ser maior que zero.")
        BigDecimal expectedAmount,

        @JsonAlias({"emissionDate", "expenseDate"})
        LocalDate issueDate,

        @JsonAlias("documento")
        @Size(max = 255, message = "Documento deve ter no máximo 255 caracteres.")
        String document,

        Long defaultAccountId,

        @Size(max = 2000, message = "Notas devem ter no máximo 2000 caracteres.")
        String notes
) {
}
