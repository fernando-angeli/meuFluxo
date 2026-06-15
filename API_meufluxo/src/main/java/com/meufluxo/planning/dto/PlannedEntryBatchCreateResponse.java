package com.meufluxo.planning.dto;

import java.util.List;
import java.util.UUID;

public record PlannedEntryBatchCreateResponse(
        UUID groupId,
        List<PlannedEntryResponse> entries
) {
}
