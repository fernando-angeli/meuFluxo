package com.meufluxo.mapper;

import com.meufluxo.dto.BaseResponse;
import com.meufluxo.dto.plannedEntry.PlannedEntryCreateRequest;
import com.meufluxo.dto.plannedEntry.PlannedEntryResponse;
import com.meufluxo.model.PlannedEntry;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PlannedEntryMapper {

    PlannedEntry toEntity(PlannedEntryCreateRequest request);

    @Mapping(target = "meta", source = ".")
    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "subCategoryId", source = "subCategory.id")
    @Mapping(target = "defaultAccountId", source = "defaultAccount.id")
    @Mapping(target = "settledAccountId", source = "settledAccount.id")
    @Mapping(target = "movementId", source = "movement.id")
    PlannedEntryResponse toResponse(PlannedEntry plannedEntry);

    BaseResponse toBaseResponse(PlannedEntry plannedEntry);
}
