package com.meufluxo.dto.cashMovement;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.meufluxo.enums.MovementType;
import com.meufluxo.enums.PaymentMethod;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CashMovementUpdateRequest(
        @Positive(message = "Valor deve ser positivo")
        BigDecimal amount,

        MovementType movementType,

        PaymentMethod paymentMethod,

        Long categoryId,

        Long accountId,

        @Size(min = 3, message = "A descrição deve conter no mínimo 3 caracteres")
        String description,

        String notes,

        LocalDate occurredAt,

        @JsonIgnore
        Boolean active
) {
}
