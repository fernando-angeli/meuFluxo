package com.meufluxo.controller;

import com.meufluxo.common.dto.PageResponse;
import com.meufluxo.dto.holiday.HolidayResponse;
import com.meufluxo.enums.HolidayScope;
import com.meufluxo.service.HolidayService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/holidays")
@Tag(name = "Feriados", description = "Operações de consulta de feriados")
public class HolidayController {

    private final HolidayService holidayService;

    public HolidayController(HolidayService holidayService) {
        this.holidayService = holidayService;
    }

    @GetMapping
    @Operation(summary = "Listar feriados")
    public PageResponse<HolidayResponse> getHolidays(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) HolidayScope scope,
            @PageableDefault(
                    page = 0,
                    size = 20,
                    sort = "holidayDate",
                    direction = Sort.Direction.ASC
            )
            Pageable pageable
    ) {
        return holidayService.findByFilters(startDate, endDate, scope, pageable);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar feriado por ID")
    public ResponseEntity<HolidayResponse> getHolidayById(@PathVariable Long id) {
        return ResponseEntity.ok(holidayService.findById(id));
    }
}
