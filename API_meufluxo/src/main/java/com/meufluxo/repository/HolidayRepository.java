package com.meufluxo.repository;

import com.meufluxo.enums.HolidayScope;
import com.meufluxo.model.Holiday;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface HolidayRepository extends JpaRepository<Holiday, Long> {

    List<Holiday> findAllByHolidayDateAndActiveTrue(LocalDate holidayDate);

    boolean existsByHolidayDateAndScopeAndCountryCodeAndActiveTrue(
            LocalDate holidayDate,
            HolidayScope scope,
            String countryCode
    );
}
