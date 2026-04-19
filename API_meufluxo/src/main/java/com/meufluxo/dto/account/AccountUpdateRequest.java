package com.meufluxo.dto.account;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AccountUpdateRequest(

        @NotBlank(message = "O nome da categoria é obrigatório")
        @Size(min = 3, message = "O nome da categoria deve conter no mínimo 3 caracteres")
        String name,

        Boolean active,

        Integer bankCode,
        String bankName,
        String agency,
        String accountNumber,
        BigDecimal overdraftLimit

) {
}
