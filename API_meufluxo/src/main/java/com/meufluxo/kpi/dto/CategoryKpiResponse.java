package com.meufluxo.kpi.dto;

import java.math.BigDecimal;

public record CategoryKpiResponse(
        Long categoryId,
        String categoryName,
        BigDecimal total,
        Integer percent
) {
}
