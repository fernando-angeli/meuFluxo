package com.meufluxo.category.dto;

import com.meufluxo.category.dto.CategorySimpleResponse;

public record SubCategorySimpleResponse(
        Long id,
        String name,
        CategorySimpleResponse category
) {
}
