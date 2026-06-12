package com.meufluxo.kpi.dto;

import java.math.BigDecimal;

public record SubCategoryGroupedKpiResponse(
        Long subCategoryId,
        String subCategoryName,
        BigDecimal total,
        Integer percent
) {
}
