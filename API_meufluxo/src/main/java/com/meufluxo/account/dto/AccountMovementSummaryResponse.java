package com.meufluxo.account.dto;

import java.math.BigDecimal;

public record AccountMovementSummaryResponse(
        BigDecimal totalIncome,
        BigDecimal totalExpense,
        BigDecimal netAmount
) {
}
