package com.meufluxo.dto.holiday;

import com.meufluxo.dto.BaseResponse;
import com.meufluxo.enums.HolidayScope;

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
