package com.meufluxo.holiday.mapper;

import com.meufluxo.shared.dto.BaseResponse;
import com.meufluxo.holiday.dto.HolidayResponse;
import com.meufluxo.holiday.model.Holiday;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface HolidayMapper {

    @Mapping(target = "workspaceId", source = "workspace.id")
    @Mapping(target = "meta", source = ".")
    HolidayResponse toResponse(Holiday holiday);

    BaseResponse toBaseResponse(Holiday holiday);
}
