package com.meufluxo.dto.plannedEntry;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.meufluxo.enums.PlannedAmountBehavior;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record PlannedEntryBatchCreateRequest(
        @NotBlank(message = "Descrição é obrigatória.")
        @Size(max = 255, message = "Descrição deve ter no máximo 255 caracteres.")
        String description,

        @NotNull(message = "Categoria é obrigatória.")
        Long categoryId,

        @JsonAlias("subcategoryId")
        Long subCategoryId,

        @NotNull(message = "Comportamento do valor é obrigatório.")
        PlannedAmountBehavior amountBehavior,

        Long defaultAccountId,

        @Size(max = 2000, message = "Notas devem ter no máximo 2000 caracteres.")
        String notes,

        @NotEmpty(message = "Lista de lançamentos é obrigatória e não pode estar vazia.")
        List<@Valid PlannedEntryBatchItemRequest> entries
) {
}
