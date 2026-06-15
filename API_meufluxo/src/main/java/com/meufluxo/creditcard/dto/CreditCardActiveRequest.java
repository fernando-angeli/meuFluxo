package com.meufluxo.creditcard.dto;

import jakarta.validation.constraints.NotNull;

public record CreditCardActiveRequest(
        @NotNull(message = "O status ativo/inativo é obrigatório")
        Boolean active
) {
}
