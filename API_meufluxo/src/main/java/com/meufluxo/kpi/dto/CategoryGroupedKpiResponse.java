package com.meufluxo.kpi.dto;

import com.meufluxo.cashmovement.model.MovementType;

import java.math.BigDecimal;
import java.util.List;

public record CategoryGroupedKpiResponse(
        Long categoryId,
        String categoryName,
        MovementType movementType,
        BigDecimal total,
        Integer percent,
        List<SubCategoryGroupedKpiResponse> subCategories
) {
}
