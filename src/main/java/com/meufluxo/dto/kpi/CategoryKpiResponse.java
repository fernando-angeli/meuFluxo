package com.meufluxo.dto.kpi;

import java.math.BigDecimal;

public record CategoryKpiResponse(
        Long categoryId,
        String categoryName,
        BigDecimal total
) {
}
