package com.meufluxo.category.mapper;

import com.meufluxo.shared.dto.BaseResponse;
import com.meufluxo.category.dto.CategoryRequest;
import com.meufluxo.category.dto.CategoryResponse;
import com.meufluxo.cashmovement.model.MovementType;
import com.meufluxo.category.model.Category;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CategoryMapper {

    Category toEntity(CategoryRequest categoryCreateRequest);

    @Mapping(target = "meta", source = ".")
    @Mapping(target = "subCategoryCount", ignore = true)
    CategoryResponse toResponse(Category category);

    BaseResponse toBaseResponse(Category category);

    default MovementType map(String value) {
        if (value == null) return null;
        try {
            return MovementType.valueOf(value);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Tipo inválido para MovementType: " + value);
        }
    }

}
