package com.meufluxo.mapper;

import com.meufluxo.dto.BaseResponse;
import com.meufluxo.dto.holiday.HolidayResponse;
import com.meufluxo.model.Holiday;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface HolidayMapper {

    @Mapping(target = "workspaceId", source = "workspace.id")
    @Mapping(target = "meta", source = ".")
    HolidayResponse toResponse(Holiday holiday);

    BaseResponse toBaseResponse(Holiday holiday);
}
