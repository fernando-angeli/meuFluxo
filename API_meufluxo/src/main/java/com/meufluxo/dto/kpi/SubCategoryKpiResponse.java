package com.meufluxo.dto.kpi;

import java.math.BigDecimal;

public record SubCategoryKpiResponse(
        Long categoryId,
        String categoryName,
        Long subCategoryId,
        String subCategoryName,
        BigDecimal total,
        Integer percent
) {
}
