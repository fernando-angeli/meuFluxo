package com.meufluxo.dto.kpi;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record InvoicePaymentBreakdownResponse(
        long cashMovementId,
        long invoiceId,
        LocalDate invoiceDueDate,
        BigDecimal paymentAmount,
        List<InvoicePaymentAllocationLineResponse> lines
) {
}
