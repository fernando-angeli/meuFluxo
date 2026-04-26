package com.meufluxo.dto.creditCardInvoicePayment;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreditCardInvoicePaymentByInvoiceRequest(
        @NotNull(message = "A conta de pagamento é obrigatória")
        Long accountId,

        @NotNull(message = "A data de pagamento é obrigatória")
        LocalDate paymentDate,

        @NotNull(message = "O valor do pagamento é obrigatório")
        @Positive(message = "O valor do pagamento deve ser positivo")
        BigDecimal amount,

        @Size(max = 1000, message = "As observações podem ter no máximo 1000 caracteres")
        String notes
) {
}
