package com.meufluxo.dto.kpi;

import java.time.LocalDate;
import java.util.List;

public record DashboardKpiRequest(
        LocalDate startDate,
        LocalDate endDate,
        List<Long> accountId,
        List<Long> categoryId
) {
}
