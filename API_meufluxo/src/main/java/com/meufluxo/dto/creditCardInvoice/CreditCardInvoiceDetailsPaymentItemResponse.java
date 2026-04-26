package com.meufluxo.dto.creditCardInvoice;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreditCardInvoiceDetailsPaymentItemResponse(
        Long id,
        Long accountId,
        String accountName,
        LocalDate paymentDate,
        BigDecimal amount,
        String notes,
        Long movementId
) {
}
