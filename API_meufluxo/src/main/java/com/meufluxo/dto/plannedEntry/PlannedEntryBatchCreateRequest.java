package com.meufluxo.dto.plannedEntry;

import com.meufluxo.enums.PlannedAmountBehavior;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PlannedEntryBatchCreateRequest(
        @NotBlank(message = "Descrição é obrigatória.")
        @Size(max = 255, message = "Descrição deve ter no máximo 255 caracteres.")
        String description,

        @NotNull(message = "Categoria é obrigatória.")
        Long categoryId,

        Long subCategoryId,

        @NotNull(message = "Valor esperado é obrigatório.")
        @Positive(message = "Valor esperado deve ser maior que zero.")
        BigDecimal expectedAmount,

        @NotNull(message = "Comportamento do valor é obrigatório.")
        PlannedAmountBehavior amountBehavior,

        @NotNull(message = "Primeira data de vencimento é obrigatória.")
        LocalDate firstDueDate,

        @NotNull(message = "Quantidade de meses é obrigatória.")
        @Min(value = 1, message = "Quantidade de meses deve ser no mínimo 1.")
        @Max(value = 120, message = "Quantidade de meses deve ser no máximo 120.")
        Integer monthsToGenerate,

        Long defaultAccountId,

        @Size(max = 2000, message = "Notas devem ter no máximo 2000 caracteres.")
        String notes
) {
}
