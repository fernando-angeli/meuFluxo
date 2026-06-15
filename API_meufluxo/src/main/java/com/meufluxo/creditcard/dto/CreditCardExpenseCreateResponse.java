package com.meufluxo.creditcard.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record CreditCardExpenseCreateResponse(
        UUID installmentGroupId,
        Integer installmentCount,
        BigDecimal totalAmount,
        List<CreditCardExpenseResponse> expenses
) {
}
