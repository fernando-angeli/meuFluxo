package com.meufluxo.dto.subCategory;

import com.meufluxo.dto.BaseResponse;
import com.meufluxo.dto.category.CategorySimpleResponse;
import com.meufluxo.enums.MovementType;

public record SubCategoryResponse(
        Long id,
        String name,
        MovementType movementType,
        CategorySimpleResponse category,
        BaseResponse meta
) {
}
