package com.meufluxo.dto.category;

import com.meufluxo.dto.BaseResponse;
import com.meufluxo.enums.MovementType;

public record CategoryResponse(

        Long id,
        String name,
        MovementType movementType,
        BaseResponse meta

) {
}
