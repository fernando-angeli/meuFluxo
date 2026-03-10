package com.meufluxo.dto.kpi;

import com.meufluxo.enums.MovementType;
import com.meufluxo.enums.PaymentMethod;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;
import java.util.List;

@Schema(description = "Filters used to calculate dashboard KPIs")
public record DashboardKpiRequest(

        @Schema(description = "Start date of the analysis period", example = "2026-01-01")
        LocalDate startDate,

        @Schema(description = "End date of the analysis period", example = "2026-01-31")
        LocalDate endDate,

        @Schema(description = "Multiple account IDs used to filter (comma-separated or repeated query param)", example = "1,2,3")
        List<Long> accountIds,

        @Schema(description = "Multiple category IDs used to filter (comma-separated or repeated query param)", example = "5,6")
        List<Long> categoryIds,

        @Schema(description = "Multiple subcategory IDs used to filter (comma-separated or repeated query param)", example = "16,17")
        List<Long> subCategoryIds,

        @Schema(description = "Payment method used to filter", example = "PIX")
        PaymentMethod paymentMethod,

        @Schema(description = "Movement type used to filter", example = "EXPENSE")
        MovementType movementType

) {}
