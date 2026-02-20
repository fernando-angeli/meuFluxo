package com.meufluxo.dto.category;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CategoryUpdateRequest(

        @NotBlank(message = "O nome da categoria é obrigatório")
        @Size(min = 3, message = "O nome da categoria deve conter no mínimo 3 caracteres")
        String name,

        Boolean active

) {
}
