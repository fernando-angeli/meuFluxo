package com.meufluxo.dto.creditCardInvoicePayment;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record CreditCardInvoicePaymentResponse(
        Long id,
        Long invoiceId,
        String invoiceReference,
        Long accountId,
        String accountName,
        LocalDate paymentDate,
        BigDecimal amount,
        String notes,
        Long movementId,
        boolean active,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
