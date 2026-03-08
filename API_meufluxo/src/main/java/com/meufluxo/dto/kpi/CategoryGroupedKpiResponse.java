package com.meufluxo.dto.kpi;

import java.math.BigDecimal;
import java.util.List;

public record CategoryGroupedKpiResponse(
        Long categoryId,
        String categoryName,
        BigDecimal total,
        Integer percent,
        List<SubCategoryGroupedKpiResponse> subCategories
) {
}
