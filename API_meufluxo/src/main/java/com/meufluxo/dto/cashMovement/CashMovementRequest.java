package com.meufluxo.dto.cashMovement;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.meufluxo.enums.MovementType;
import com.meufluxo.enums.PaymentMethod;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CashMovementRequest(

        @NotNull(message = "O valor do movimento é obrigatório")
        @Positive(message = "Valor deve ser positivo")
        BigDecimal amount,

        MovementType movementType,

        @NotNull(message = "O tipo de pagamento é obrigatório")
        PaymentMethod paymentMethod,

        @JsonAlias({"occurred_at", "movementDate"})
        LocalDate occurredAt,

        @NotNull(message = "A sub-categoria é obrigatória")
        Long subCategoryId,

        @NotNull(message = "A conta é obrigatória")
        Long accountId,

        @NotBlank(message = "Informe uma descrição para este movimento")
        @Size(min = 3, message = "A descrição deve conter no mínimo 3 caracteres")
        String description,

        String notes,

        /** Vincula o movimento à fatura do cartão (ex.: pagamento de fatura). Opcional. */
        Long creditCardInvoiceId
) {
}
