package com.meufluxo.dto.plannedEntry;

import java.util.UUID;

public record PlannedEntryFutureOpenUpdateResponse(
        UUID groupId,
        int updatedCount
) {
}
