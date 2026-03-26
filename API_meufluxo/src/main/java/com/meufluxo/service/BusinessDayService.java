package com.meufluxo.service;

import com.meufluxo.enums.HolidayScope;
import com.meufluxo.model.Holiday;
import com.meufluxo.repository.HolidayRepository;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;

@Service
public class BusinessDayService {

    private static final String COUNTRY_CODE_BR = "BR";

    private final HolidayRepository holidayRepository;

    public BusinessDayService(HolidayRepository holidayRepository) {
        this.holidayRepository = holidayRepository;
    }

    /**
     * MVP: considera dia útil quando não é sábado/domingo e não é feriado nacional ativo do Brasil.
     */
    public LocalDate adjustToNextBusinessDay(LocalDate date) {
        return adjustToNextBusinessDay(date, null);
    }

    /**
     * Mantém assinatura preparada para escopos futuros (workspace/state/city).
     */
    public LocalDate adjustToNextBusinessDay(LocalDate date, Long workspaceId) {
        LocalDate cursor = date;
        while (!isBusinessDay(cursor, workspaceId)) {
            cursor = cursor.plusDays(1);
        }
        return cursor;
    }

    public boolean isBusinessDay(LocalDate date) {
        return isBusinessDay(date, null);
    }

    public boolean isBusinessDay(LocalDate date, Long workspaceId) {
        DayOfWeek dayOfWeek = date.getDayOfWeek();
        if (dayOfWeek == DayOfWeek.SATURDAY || dayOfWeek == DayOfWeek.SUNDAY) {
            return false;
        }

        List<Holiday> holidays = holidayRepository.findAllByHolidayDateAndActiveTrue(date);
        for (Holiday holiday : holidays) {
            if (isApplicableHoliday(holiday, workspaceId)) {
                return false;
            }
        }
        return true;
    }

    private boolean isApplicableHoliday(Holiday holiday, Long workspaceId) {
        if (holiday.getScope() == HolidayScope.NATIONAL) {
            return COUNTRY_CODE_BR.equalsIgnoreCase(holiday.getCountryCode());
        }
        if (holiday.getScope() == HolidayScope.WORKSPACE) {
            return workspaceId != null
                    && holiday.getWorkspace() != null
                    && workspaceId.equals(holiday.getWorkspace().getId());
        }
        return false;
    }
}
