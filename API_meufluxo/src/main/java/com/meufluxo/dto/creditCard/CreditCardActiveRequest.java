package com.meufluxo.dto.creditCard;

import jakarta.validation.constraints.NotNull;

public record CreditCardActiveRequest(
        @NotNull(message = "O status ativo/inativo é obrigatório")
        Boolean active
) {
}
