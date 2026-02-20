package com.meufluxo.dto.category;

import com.meufluxo.enums.MovementType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CategoryRequest(

        @NotBlank(message = "O nome da categoria é obrigatório")
        @Size(min = 3, message = "O nome da categoria deve conter no mínimo 3 caracteres")
        String name,

        @NotNull(message = "O tipo de categoria é obrigatório")
        MovementType movementType
) {
}
