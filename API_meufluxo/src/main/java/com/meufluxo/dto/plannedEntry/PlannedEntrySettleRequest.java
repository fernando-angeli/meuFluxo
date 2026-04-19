package com.meufluxo.dto.plannedEntry;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Corpo da baixa manual de despesa ou confirmação de recebimento de receita planejada.
 * Alinhado ao contrato do frontend ({@code ExpenseSettleRequest}).
 */
public record PlannedEntrySettleRequest(
        @NotNull(message = "Valor liquidado é obrigatório")
        @Positive(message = "Valor liquidado deve ser maior que zero")
        BigDecimal actualAmount,

        @NotNull(message = "Data da liquidação é obrigatória")
        LocalDate settledAt,

        @NotNull(message = "Conta da liquidação é obrigatória")
        Long settledAccountId,

        String notes
) {
}
