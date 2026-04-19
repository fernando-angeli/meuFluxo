package com.meufluxo.dto.account;

import java.math.BigDecimal;

public record AccountMovementSummaryResponse(
        BigDecimal totalIncome,
        BigDecimal totalExpense,
        BigDecimal netAmount
) {
}
