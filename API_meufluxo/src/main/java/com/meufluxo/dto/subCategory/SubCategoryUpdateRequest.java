package com.meufluxo.dto.subCategory;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SubCategoryUpdateRequest(

        @NotBlank(message = "O nome da sub-categoria é obrigatório")
        @Size(min = 3, message = "O nome da sub-categoria deve conter no mínimo 3 caracteres")
        String name,
        Long categoryId,
        Boolean active,

        @Size(max = 1000, message = "A descrição pode ter no máximo 1000 caracteres")
        String description

) {
}
