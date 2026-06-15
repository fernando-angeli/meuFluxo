package com.meufluxo.category.mapper;

import com.meufluxo.shared.dto.BaseResponse;
import com.meufluxo.category.dto.CategorySimpleResponse;
import com.meufluxo.category.dto.SubCategoryRequest;
import com.meufluxo.category.dto.SubCategoryResponse;
import com.meufluxo.cashmovement.model.MovementType;
import com.meufluxo.category.model.Category;
import com.meufluxo.category.model.SubCategory;
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
