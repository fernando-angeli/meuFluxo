package com.meufluxo.dto.creditCard;

import com.meufluxo.enums.BrandCard;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record CreditCardUpdateRequest(
        @NotBlank(message = "O nome do cartão é obrigatório")
        @Size(min = 3, max = 120, message = "O nome do cartão deve conter entre 3 e 120 caracteres")
        String name,

        @NotNull(message = "A bandeira do cartão é obrigatória")
        BrandCard brand,

        @NotNull(message = "O dia de fechamento é obrigatório")
        @Min(value = 1, message = "O dia de fechamento deve ser entre 1 e 31")
        @Max(value = 31, message = "O dia de fechamento deve ser entre 1 e 31")
        Integer closingDay,

        @NotNull(message = "O dia de vencimento é obrigatório")
        @Min(value = 1, message = "O dia de vencimento deve ser entre 1 e 31")
        @Max(value = 31, message = "O dia de vencimento deve ser entre 1 e 31")
        Integer dueDay,

        BigDecimal creditLimit,
        Long defaultPaymentAccountId,

        @Size(max = 1000, message = "As observações podem ter no máximo 1000 caracteres")
        String notes,

        @NotNull(message = "O status ativo/inativo é obrigatório")
        Boolean active
) {
}
