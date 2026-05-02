package com.meufluxo.controller;

import com.meufluxo.dto.kpi.DashboardKpiRequest;
import com.meufluxo.dto.kpi.DashboardKpiResponse;
import com.meufluxo.service.KpiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/kpis")
@Tag(name = "KPIs", description = "Endpoints responsible for financial indicators and dashboard data")
public class KpiController {

    private final KpiService kpiService;

    public KpiController(KpiService kpiService) {
        this.kpiService = kpiService;
    }

    @Operation(
            summary = "Get dashboard KPIs",
            description = """
                    Returns the main financial indicators used in the dashboard.
                    
                    The endpoint supports filtering by:
                    - Date range
                    - Account
                    - Category
                    - Subcategory
                    - Payment method
                    - Movement type
                    
                    If no filters are provided, the KPIs are calculated considering all data.
                    """
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Dashboard KPIs retrieved successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request parameters"),
            @ApiResponse(responseCode = "500", description = "Unexpected server error")
    })
    @Parameters({
            @Parameter(
                    name = "startDate",
                    description = "Start date for KPI calculation",
                    example = "2026-01-01"
            ),
            @Parameter(
                    name = "endDate",
                    description = "End date for KPI calculation",
                    example = "2026-01-31"
            ),
            @Parameter(
                    name = "accountIds",
                    description = "Multiple account IDs (comma-separated or repeated query param)",
                    example = "1,2,3"
            ),
            @Parameter(
                    name = "categoryIds",
                    description = "Multiple category IDs (comma-separated or repeated query param)",
                    example = "5,6"
            ),
            @Parameter(
                    name = "subCategoryIds",
                    description = "Multiple subcategory IDs (comma-separated or repeated query param)",
                    example = "16,17"
            ),
            @Parameter(
                    name = "paymentMethod",
                    description = "Payment method used to filter the dashboard",
                    example = "PIX"
            ),
            @Parameter(
                    name = "movementType",
                    description = "Movement type used to filter the dashboard",
                    example = "EXPENSE"
            ),
            @Parameter(
                    name = "includeProjections",
                    description = "When true, includes planned income/expense still OPEN: due in the selected period, or overdue (due before period start) in KPI totals and category breakdowns",
                    example = "false"
            )
    })
    @GetMapping("/dashboard")
    public DashboardKpiResponse getDashboardKpis(
            @ModelAttribute DashboardKpiRequest request,
            @RequestParam(name = "includeProjections", required = false) Boolean includeProjectionsQuery
    ) {
        Boolean includeProjections = includeProjectionsQuery != null
                ? includeProjectionsQuery
                : request.includeProjections();
        DashboardKpiRequest resolved = new DashboardKpiRequest(
                request.startDate(),
                request.endDate(),
                request.accountIds(),
                request.categoryIds(),
                request.subCategoryIds(),
                request.paymentMethod(),
                request.movementType(),
                includeProjections
        );
        return kpiService.getDashboardKpis(resolved);
    }
}
