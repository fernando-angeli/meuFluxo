package com.meufluxo.dto.subCategory;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SubCategoryRequest(
        @NotBlank(message = "O nome da sub-categoria é obrigatório")
        @Size(min = 3, message = "O nome da sub-categoria deve conter no mínimo 3 caracteres")
        String name,

        @NotNull(message = "A categoria é obrigatória")
        Long categoryId
) {
}
