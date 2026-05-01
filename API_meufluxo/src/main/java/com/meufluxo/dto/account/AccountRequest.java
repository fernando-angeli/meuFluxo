package com.meufluxo.dto.account;

import com.meufluxo.enums.AccountType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record AccountRequest(

        @NotBlank(message = "O nome da categoria é obrigatório")
        @Size(min = 3, message = "O nome da categoria deve conter no mínimo 3 caracteres")
        String name,

        @NotNull(message = "O tipo de categoria é obrigatório")
        AccountType accountType,

        @NotNull(message = "O saldo inicial é obrigatório")
        BigDecimal initialBalance,

        @NotNull(message = "A data do saldo inicial é obrigatória")
        LocalDate initialBalanceDate,

        Integer bankCode,
        String bankName,
        String agency,
        String accountNumber,
        BigDecimal overdraftLimit

) {
}
