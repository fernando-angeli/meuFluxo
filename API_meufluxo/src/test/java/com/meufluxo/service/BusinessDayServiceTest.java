package com.meufluxo.service;

import com.meufluxo.repository.HolidayRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BusinessDayServiceTest {

    @Mock
    private HolidayRepository holidayRepository;
    @Mock
    private CurrentUserService currentUserService;

    @Test
    void shouldAdjustWeekendToNextBusinessDay() {
        BusinessDayService service = new BusinessDayService(holidayRepository, currentUserService);
        LocalDate saturday = LocalDate.of(2026, 4, 18);

        when(currentUserService.getCurrentCountryCode()).thenReturn("BR");
        when(currentUserService.getCurrentWorkspaceId()).thenReturn(0L);
        when(holidayRepository.existsApplicableHoliday(LocalDate.of(2026, 4, 20), "BR", 0L))
                .thenReturn(false);

        LocalDate adjusted = service.adjustToNextBusinessDay(saturday);
        assertEquals(LocalDate.of(2026, 4, 20), adjusted);
    }

    @Test
    void shouldSkipNationalHolidayForBrazil() {
        BusinessDayService service = new BusinessDayService(holidayRepository, currentUserService);
        LocalDate laborDay = LocalDate.of(2026, 5, 1);

        when(currentUserService.getCurrentCountryCode()).thenReturn("BR");
        when(currentUserService.getCurrentWorkspaceId()).thenReturn(0L);
        when(holidayRepository.existsApplicableHoliday(laborDay, "BR", 0L)).thenReturn(true);
        when(holidayRepository.existsApplicableHoliday(LocalDate.of(2026, 5, 4), "BR", 0L)).thenReturn(false);

        LocalDate adjusted = service.adjustToNextBusinessDay(laborDay);
        assertEquals(LocalDate.of(2026, 5, 4), adjusted);
    }

    @Test
    void shouldApplyNationalHolidayIndependentOfWorkspaceId() {
        BusinessDayService service = new BusinessDayService(holidayRepository, currentUserService);
        LocalDate date = LocalDate.of(2026, 6, 10);

        when(holidayRepository.existsApplicableHoliday(date, "BR", 99L)).thenReturn(true);
        when(holidayRepository.existsApplicableHoliday(date, "BR", 10L)).thenReturn(true);

        assertFalse(service.isBusinessDay(date, 99L));
        assertFalse(service.isBusinessDay(date, 10L));
    }

    @Test
    void shouldConsiderWorkspaceHolidayTogetherWithNational() {
        BusinessDayService service = new BusinessDayService(holidayRepository, currentUserService);
        LocalDate date = LocalDate.of(2026, 6, 10);

        when(holidayRepository.existsApplicableHoliday(date, "BR", 99L)).thenReturn(true);
        when(holidayRepository.existsApplicableHoliday(date.plusDays(1), "BR", 99L)).thenReturn(false);

        assertEquals(date.plusDays(1), service.adjustToNextBusinessDay(date, 99L, "BR"));
    }

    @Test
    void shouldAdjustHolidayToNextBusinessDay() {
        BusinessDayService service = new BusinessDayService(holidayRepository, currentUserService);
        LocalDate holidayDate = LocalDate.of(2026, 5, 1);

        when(holidayRepository.existsApplicableHoliday(holidayDate, "BR", 10L)).thenReturn(true);
        when(holidayRepository.existsApplicableHoliday(LocalDate.of(2026, 5, 4), "BR", 10L)).thenReturn(false);

        LocalDate adjusted = service.adjustToNextBusinessDay(holidayDate, 10L, "BR");
        assertEquals(LocalDate.of(2026, 5, 4), adjusted);
    }

    @Test
    void shouldAdjustWeekendToNextBusinessDayWithExplicitContext() {
        BusinessDayService service = new BusinessDayService(holidayRepository, currentUserService);
        LocalDate sunday = LocalDate.of(2026, 4, 19);

        when(holidayRepository.existsApplicableHoliday(LocalDate.of(2026, 4, 20), "BR", 10L)).thenReturn(false);

        LocalDate adjusted = service.adjustToNextBusinessDay(sunday, 10L, "BR");
        assertEquals(LocalDate.of(2026, 4, 20), adjusted);
    }

    @Test
    void shouldUseCountryCodeFromCurrentContext() {
        BusinessDayService service = new BusinessDayService(holidayRepository, currentUserService);
        LocalDate date = LocalDate.of(2026, 5, 1);

        when(currentUserService.getCurrentCountryCode()).thenReturn("US");
        when(currentUserService.getCurrentWorkspaceId()).thenReturn(10L);
        when(holidayRepository.existsApplicableHoliday(date, "US", 10L)).thenReturn(true);

        assertFalse(service.isBusinessDay(date));
    }
}
