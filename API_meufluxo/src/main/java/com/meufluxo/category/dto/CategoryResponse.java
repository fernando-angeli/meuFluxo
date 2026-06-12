package com.meufluxo.category.dto;

import com.meufluxo.shared.dto.BaseResponse;
import com.meufluxo.cashmovement.model.MovementType;

public record CategoryResponse(

        Long id,
        String name,
        MovementType movementType,
        BaseResponse meta,
        String description,
        Long subCategoryCount

) {
}
