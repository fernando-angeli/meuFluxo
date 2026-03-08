package com.meufluxo.mapper;

import com.meufluxo.dto.BaseResponse;
import com.meufluxo.dto.category.CategorySimpleResponse;
import com.meufluxo.dto.subCategory.SubCategoryRequest;
import com.meufluxo.dto.subCategory.SubCategoryResponse;
import com.meufluxo.enums.MovementType;
import com.meufluxo.model.Category;
import com.meufluxo.model.SubCategory;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SubCategoryMapper {

    SubCategory toEntity(SubCategoryRequest subCategoryCreateRequest);

    @Mapping(target = "meta", source = ".")
    @Mapping(target = "movementType", source = "category.movementType")
    @Mapping(target = "category", source = "category")
    SubCategoryResponse toResponse(SubCategory subCategory);

    BaseResponse toBaseResponse(SubCategory subCategory);

    CategorySimpleResponse toCategorySimpleResponse(Category category);

    default MovementType map(String value) {
        if (value == null) return null;
        try {
            return MovementType.valueOf(value);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Tipo inválido para MovementType: " + value);
        }
    }

}
