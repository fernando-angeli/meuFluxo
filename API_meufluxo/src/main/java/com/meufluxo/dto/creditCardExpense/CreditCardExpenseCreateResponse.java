package com.meufluxo.dto.creditCardExpense;

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
