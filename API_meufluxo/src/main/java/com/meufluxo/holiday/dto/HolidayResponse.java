package com.meufluxo.holiday.dto;

import com.meufluxo.shared.dto.BaseResponse;
import com.meufluxo.holiday.model.HolidayScope;

import java.time.LocalDate;

public record HolidayResponse(
        Long id,
        String name,
        LocalDate holidayDate,
        HolidayScope scope,
        String countryCode,
        String stateCode,
        String cityName,
        Long workspaceId,
        BaseResponse meta
) {
}
