package com.meufluxo.service;

import com.meufluxo.enums.HolidayScope;
import com.meufluxo.model.Holiday;
import com.meufluxo.model.workspaceAndUsers.Workspace;
import com.meufluxo.repository.HolidayRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BusinessDayServiceTest {

    @Mock
    private HolidayRepository holidayRepository;

    @Test
    void shouldAdjustWeekendToNextBusinessDay() {
        BusinessDayService service = new BusinessDayService(holidayRepository);
        LocalDate saturday = LocalDate.of(2026, 4, 18);

        when(holidayRepository.findAllByHolidayDateAndActiveTrue(LocalDate.of(2026, 4, 20)))
                .thenReturn(List.of());

        LocalDate adjusted = service.adjustToNextBusinessDay(saturday);
        assertEquals(LocalDate.of(2026, 4, 20), adjusted);
    }

    @Test
    void shouldSkipNationalHoliday() {
        BusinessDayService service = new BusinessDayService(holidayRepository);
        LocalDate laborDay = LocalDate.of(2026, 5, 1);

        Holiday holiday = new Holiday();
        holiday.setScope(HolidayScope.NATIONAL);
        holiday.setCountryCode("BR");
        holiday.setHolidayDate(laborDay);

        when(holidayRepository.findAllByHolidayDateAndActiveTrue(laborDay))
                .thenReturn(List.of(holiday));
        when(holidayRepository.findAllByHolidayDateAndActiveTrue(LocalDate.of(2026, 5, 4)))
                .thenReturn(List.of());

        LocalDate adjusted = service.adjustToNextBusinessDay(laborDay);
        assertEquals(LocalDate.of(2026, 5, 4), adjusted);
    }

    @Test
    void shouldRespectWorkspaceScopedHolidayWhenWorkspaceProvided() {
        BusinessDayService service = new BusinessDayService(holidayRepository);
        LocalDate date = LocalDate.of(2026, 6, 10);

        Workspace workspace = new Workspace();
        workspace.setId(99L);

        Holiday workspaceHoliday = new Holiday();
        workspaceHoliday.setScope(HolidayScope.WORKSPACE);
        workspaceHoliday.setWorkspace(workspace);

        when(holidayRepository.findAllByHolidayDateAndActiveTrue(date))
                .thenReturn(List.of(workspaceHoliday));
        when(holidayRepository.findAllByHolidayDateAndActiveTrue(date.plusDays(1)))
                .thenReturn(List.of());

        assertFalse(service.isBusinessDay(date, 99L));
        assertTrue(service.isBusinessDay(date, 10L));
        assertEquals(date.plusDays(1), service.adjustToNextBusinessDay(date, 99L));
    }
}
