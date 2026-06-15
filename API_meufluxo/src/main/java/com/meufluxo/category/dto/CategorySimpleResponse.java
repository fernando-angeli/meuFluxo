package com.meufluxo.category.dto;

import com.meufluxo.cashmovement.model.MovementType;

public record CategorySimpleResponse(

        Long id,
        String name,
        MovementType types
) {
}
