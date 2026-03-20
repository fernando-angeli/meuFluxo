package com.meufluxo.dto.category;

import com.meufluxo.enums.MovementType;

public record CategorySimpleResponse(

        Long id,
        String name,
        MovementType movementType
) {
}
