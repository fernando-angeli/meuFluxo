package com.meufluxo.dto.subCategory;

import com.meufluxo.dto.category.CategorySimpleResponse;

public record SubCategorySimpleResponse(
        Long id,
        String name,
        CategorySimpleResponse category
) {
}
