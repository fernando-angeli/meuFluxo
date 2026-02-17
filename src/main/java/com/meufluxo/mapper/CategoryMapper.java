package com.meufluxo.mapper;

import com.meufluxo.dto.BaseResponse;
import com.meufluxo.dto.category.CategoryRequest;
import com.meufluxo.dto.category.CategoryResponse;
import com.meufluxo.enums.CategoryType;
import com.meufluxo.enums.MovementType;
import com.meufluxo.model.Category;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CategoryMapper {

    Category toEntity(CategoryRequest categoryCreateRequest);

    @Mapping(target = "meta", source = ".")
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
