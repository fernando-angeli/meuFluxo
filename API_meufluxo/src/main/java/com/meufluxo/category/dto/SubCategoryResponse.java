package com.meufluxo.category.dto;

import com.meufluxo.shared.dto.BaseResponse;
import com.meufluxo.category.dto.CategorySimpleResponse;
import com.meufluxo.cashmovement.model.MovementType;

public record SubCategoryResponse(
        Long id,
        String name,
        String description,
        MovementType movementType,
        CategorySimpleResponse category,
        BaseResponse meta
) {
}
