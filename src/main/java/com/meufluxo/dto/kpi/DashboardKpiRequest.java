package com.meufluxo.dto.kpi;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;
import java.util.List;

@Schema(description = "Filters used to calculate dashboard KPIs")
public record DashboardKpiRequest(

        @Schema(description = "Start date of the analysis period", example = "2026-01-01")
        LocalDate startDate,

        @Schema(description = "End date of the analysis period", example = "2026-01-31")
        LocalDate endDate,

        @Schema(description = "List of account IDs to filter", example = "[1,2]")
        List<Long> accountIds,

        @Schema(description = "List of category IDs to filter", example = "[3,5]")
        List<Long> categoryIds

) {}