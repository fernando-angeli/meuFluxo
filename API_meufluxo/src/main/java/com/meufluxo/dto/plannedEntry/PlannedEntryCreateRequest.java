package com.meufluxo.dto.plannedEntry;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.meufluxo.enums.PlannedAmountBehavior;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PlannedEntryCreateRequest(
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

        @NotNull(message = "Data de vencimento é obrigatória.")
        LocalDate dueDate,

        @JsonAlias({"emissionDate", "expenseDate"})
        LocalDate issueDate,

        @JsonAlias("documento")
        @Size(max = 255, message = "Documento deve ter no máximo 255 caracteres.")
        String document,

        Long defaultAccountId,

        @Size(max = 2000, message = "Notas devem ter no máximo 2000 caracteres.")
        String notes,

        /**
         * Quando true, após criar o lançamento em aberto, liquida na mesma operação
         * (movimento na conta na data de vencimento, valor = esperado).
         */
        Boolean settleImmediately
) {
}
