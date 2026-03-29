package com.meufluxo.repository;

import com.meufluxo.enums.HolidayScope;
import com.meufluxo.model.Holiday;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface HolidayRepository extends JpaRepository<Holiday, Long> {

    List<Holiday> findAllByHolidayDateAndActiveTrue(LocalDate holidayDate);

    boolean existsByHolidayDateAndScopeAndCountryCodeAndActiveTrue(
            LocalDate holidayDate,
            HolidayScope scope,
            String countryCode
    );

    @Query("""
            select count(holiday) > 0
            from Holiday holiday
            where holiday.active = true
              and holiday.holidayDate = :holidayDate
              and (
                    (holiday.scope = com.meufluxo.enums.HolidayScope.NATIONAL and upper(holiday.countryCode) = upper(:countryCode))
                    or
                    (holiday.scope = com.meufluxo.enums.HolidayScope.WORKSPACE and holiday.workspace.id = :workspaceId)
                  )
            """)
    boolean existsApplicableHoliday(
            @Param("holidayDate") LocalDate holidayDate,
            @Param("countryCode") String countryCode,
            @Param("workspaceId") Long workspaceId
    );
}
