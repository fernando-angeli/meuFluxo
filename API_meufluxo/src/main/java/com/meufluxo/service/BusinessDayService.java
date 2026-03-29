package com.meufluxo.service;

import com.meufluxo.repository.HolidayRepository;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;

@Service
public class BusinessDayService {

    private static final String DEFAULT_COUNTRY_CODE = "BR";

    private final HolidayRepository holidayRepository;
    private final CurrentUserService currentUserService;

    public BusinessDayService(HolidayRepository holidayRepository, CurrentUserService currentUserService) {
        this.holidayRepository = holidayRepository;
        this.currentUserService = currentUserService;
    }

    public LocalDate adjustToNextBusinessDay(LocalDate date) {
        return adjustToNextBusinessDay(date, resolveCurrentWorkspaceId(), resolveCurrentCountryCode());
    }

    public LocalDate adjustToNextBusinessDay(LocalDate date, Long workspaceId) {
        return adjustToNextBusinessDay(date, workspaceId, resolveCurrentCountryCode());
    }

    public LocalDate adjustToNextBusinessDay(LocalDate date, Long workspaceId, String countryCode) {
        LocalDate cursor = date;
        while (!isBusinessDay(cursor, workspaceId, countryCode)) {
            cursor = cursor.plusDays(1);
        }
        return cursor;
    }

    public boolean isBusinessDay(LocalDate date) {
        return isBusinessDay(date, resolveCurrentWorkspaceId(), resolveCurrentCountryCode());
    }

    public boolean isBusinessDay(LocalDate date, Long workspaceId) {
        return isBusinessDay(date, workspaceId, resolveCurrentCountryCode());
    }

    public boolean isBusinessDay(LocalDate date, Long workspaceId, String countryCode) {
        DayOfWeek dayOfWeek = date.getDayOfWeek();
        if (dayOfWeek == DayOfWeek.SATURDAY || dayOfWeek == DayOfWeek.SUNDAY) {
            return false;
        }

        return !holidayRepository.existsApplicableHoliday(
                date,
                normalizeCountryCode(countryCode),
                workspaceId
        );
    }

    private String resolveCurrentCountryCode() {
        try {
            return normalizeCountryCode(currentUserService.getCurrentCountryCode());
        } catch (RuntimeException ex) {
            return DEFAULT_COUNTRY_CODE;
        }
    }

    private Long resolveCurrentWorkspaceId() {
        try {
            return currentUserService.getCurrentWorkspaceId();
        } catch (RuntimeException ex) {
            return null;
        }
    }

    private String normalizeCountryCode(String countryCode) {
        if (countryCode == null || countryCode.isBlank()) {
            return DEFAULT_COUNTRY_CODE;
        }
        return countryCode.trim().toUpperCase();
    }
}
