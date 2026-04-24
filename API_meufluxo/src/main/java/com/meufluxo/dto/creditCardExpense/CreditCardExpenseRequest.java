package com.meufluxo.dto.creditCardExpense;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreditCardExpenseRequest(
        @NotNull(message = "O cartão de crédito é obrigatório")
        Long creditCardId,

        @NotBlank(message = "A descrição é obrigatória")
        @Size(min = 3, max = 255, message = "A descrição deve conter entre 3 e 255 caracteres")
        String description,

        @NotNull(message = "A data da compra é obrigatória")
        LocalDate purchaseDate,

        @NotNull(message = "A categoria é obrigatória")
        Long categoryId,

        Long subcategoryId,

        @NotNull(message = "O valor total da compra é obrigatório")
        @Positive(message = "O valor total da compra deve ser positivo")
        BigDecimal totalAmount,

        Integer installmentCount,

        @Size(max = 1000, message = "As observações podem ter no máximo 1000 caracteres")
        String notes
) {
}
