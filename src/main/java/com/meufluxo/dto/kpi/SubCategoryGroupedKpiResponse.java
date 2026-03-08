package com.meufluxo.dto.kpi;

import java.math.BigDecimal;

public record SubCategoryGroupedKpiResponse(
        Long subCategoryId,
        String subCategoryName,
        BigDecimal total,
        Integer percent
) {
}
