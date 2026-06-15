package com.meufluxo.kpi.dto;

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
